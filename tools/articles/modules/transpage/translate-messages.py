#!/usr/bin/env python3
"""
translate-messages.py

Value-extraction translation flow for locale JSON files:
- extracts all string leaves from en.json
- translates them in chunks per language
- restores the translated strings into the original JSON structure
- falls back to English for failed chunks
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Any, Optional

SCRIPT_DIR = Path(__file__).resolve().parent
CONFIG_PATH = SCRIPT_DIR / 'transpage_config.json'
DEFAULT_EXCLUDED_PATH_PATTERNS = (
    r'(^|.*\.)id$',
    r'(^|.*\.)icon$',
    r'(^|.*\.)href$',
    r'(^|.*\.)layout\.type$',
    r'(^|.*\.)source_urls\[\d+\]$',
)


def find_project_root() -> Path:
    current = SCRIPT_DIR
    for _ in range(8):
        if (current / 'package.json').exists():
            return current
        current = current.parent
    return SCRIPT_DIR.parent.parent.parent.parent


PROJECT_ROOT = find_project_root()


def load_config() -> dict[str, Any]:
    if not CONFIG_PATH.exists():
        print(f"[FAIL] Missing config: {CONFIG_PATH}")
        sys.exit(1)

    with open(CONFIG_PATH, 'r', encoding='utf-8') as handle:
        return json.load(handle)


def clean_json_response(text: str) -> str:
    text = text.strip()
    if text.startswith('```'):
        text = re.sub(r'^```\w*\n?', '', text)
        text = re.sub(r'\n?```$', '', text)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', text)
    return text.strip()


def call_api(content: str, lang_name: str, config: dict[str, Any]) -> Optional[str]:
    base = config['api_base_url'].rstrip('/')
    api_url = base if base.endswith('/chat/completions') else f'{base}/chat/completions'
    protected = config.get('protected_terms', {})
    protected_terms = (
        protected.get('game_names', [])
        + protected.get('character_names', [])
        + protected.get('technical_terms', [])
    )
    protected_note = (
        f"\nKeep these terms unchanged: {', '.join(protected_terms)}"
        if protected_terms
        else ''
    )
    payload = json.dumps(
        {
            'model': config.get('model', 'gemini-2.5-flash'),
            'messages': [
                {
                    'role': 'user',
                    'content': (
                        f"Translate the following JSON array values to {lang_name}.\n"
                        "Return ONLY valid JSON.\n"
                        "Each array item has an id and text field.\n"
                        "Keep ids unchanged and translate only text values."
                        f"{protected_note}\n\n{content}"
                    ),
                }
            ],
            'max_tokens': config.get('max_tokens', 32768),
            'temperature': config.get('temperature', 0.1),
        }
    ).encode('utf-8')

    request = urllib.request.Request(
        api_url,
        data=payload,
        headers={
            'Content-Type': 'application/json',
            'Authorization': f"Bearer {config['api_key']}",
        },
        method='POST',
    )

    retries = int(config.get('retry_attempts', 3))
    retry_delay = int(config.get('retry_delay', 5))
    timeout = int(config.get('timeout', 120))

    for attempt in range(1, retries + 1):
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                result = json.loads(response.read().decode('utf-8'))
                return result['choices'][0]['message']['content']
        except Exception as exc:
            print(f"    [retry {attempt}/{retries}] {exc}")
            if attempt < retries:
                time.sleep(retry_delay * attempt)

    return None


def should_translate_path(path: str, config: dict[str, Any]) -> bool:
    patterns = config.get('excluded_value_paths', [])
    for pattern in [*DEFAULT_EXCLUDED_PATH_PATTERNS, *patterns]:
        if re.fullmatch(pattern, path):
            return False
    return True


def extract_strings(value: Any, config: dict[str, Any], base_path: str = '') -> list[dict[str, str]]:
    extracted: list[dict[str, str]] = []

    if isinstance(value, str):
        if should_translate_path(base_path, config):
            extracted.append({'id': base_path, 'text': value})
        return extracted

    if isinstance(value, list):
        for index, item in enumerate(value):
            next_path = f'{base_path}[{index}]'
            extracted.extend(extract_strings(item, config, next_path))
        return extracted

    if isinstance(value, dict):
        for key, child in value.items():
            next_path = f'{base_path}.{key}' if base_path else key
            extracted.extend(extract_strings(child, config, next_path))

    return extracted


def split_chunks(items: list[dict[str, str]], chunk_count: int) -> list[list[dict[str, str]]]:
    if not items:
        return []

    size = max(1, len(items) // chunk_count)
    chunks: list[list[dict[str, str]]] = []
    current: list[dict[str, str]] = []

    for item in items:
        current.append(item)
        if len(current) >= size and len(chunks) < chunk_count - 1:
            chunks.append(current)
            current = []

    if current:
        chunks.append(current)

    return chunks


def parse_path(path: str) -> list[Any]:
    tokens: list[Any] = []
    parts = path.split('.')
    for part in parts:
        match = re.findall(r'([^\[\]]+)|\[(\d+)\]', part)
        for key, index in match:
            if key:
                tokens.append(key)
            elif index:
                tokens.append(int(index))
    return tokens


def set_path_value(target: Any, path: str, new_value: str) -> None:
    tokens = parse_path(path)
    cursor = target
    for token in tokens[:-1]:
      cursor = cursor[token]
    cursor[tokens[-1]] = new_value


def translate_chunk(
    chunk_index: int,
    total_chunks: int,
    chunk: list[dict[str, str]],
    lang_name: str,
    config: dict[str, Any],
) -> tuple[int, list[dict[str, str]]]:
    preview = ', '.join(item['id'] for item in chunk[:2])
    suffix = '...' if len(chunk) > 2 else ''
    print(f"    chunk {chunk_index}/{total_chunks}: [{preview}{suffix}] start", flush=True)

    result = call_api(json.dumps(chunk, ensure_ascii=False, indent=2), lang_name, config)
    if not result:
        print(f"    chunk {chunk_index}/{total_chunks}: API failed, fallback to English")
        return chunk_index, chunk

    cleaned = clean_json_response(result)
    try:
        parsed = json.loads(cleaned)
        if not isinstance(parsed, list):
            raise ValueError('response is not a list')

        translated_by_id = {
            item.get('id'): item.get('text')
            for item in parsed
            if isinstance(item, dict) and isinstance(item.get('id'), str) and isinstance(item.get('text'), str)
        }

        merged = []
        for item in chunk:
            merged.append(
                {
                    'id': item['id'],
                    'text': translated_by_id.get(item['id'], item['text']),
                }
            )

        print(f"    chunk {chunk_index}/{total_chunks}: done")
        return chunk_index, merged
    except Exception as exc:
        print(f"    chunk {chunk_index}/{total_chunks}: parse failed ({exc}), fallback to English")
        return chunk_index, chunk


def translate_language(
    lang: str,
    lang_name: str,
    en_data: dict[str, Any],
    config: dict[str, Any],
    overwrite: bool,
    chunk_count: int,
    concurrency: int,
) -> None:
    output_dir = PROJECT_ROOT / config.get('output_dir', 'src/locales/')
    output_path = output_dir / f'{lang}.json'
    if output_path.exists() and not overwrite:
        print(f"  [skip] {lang} already exists")
        return

    extracted = extract_strings(en_data, config)
    chunks = split_chunks(extracted, chunk_count)
    print(f"  [start] {lang} ({lang_name}) with {len(chunks)} chunks / concurrency {concurrency}")

    translated_chunks: list[Optional[list[dict[str, str]]]] = [None] * len(chunks)
    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = {
            executor.submit(translate_chunk, index + 1, len(chunks), chunk, lang_name, config): index
            for index, chunk in enumerate(chunks)
        }
        for future in as_completed(futures):
            index, translated = future.result()
            translated_chunks[index - 1] = translated

    translated_data = json.loads(json.dumps(en_data))
    for chunk in translated_chunks:
        if not chunk:
            continue
        for item in chunk:
            set_path_value(translated_data, item['id'], item['text'])

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as handle:
        json.dump(translated_data, handle, ensure_ascii=False, indent=2)
        handle.write('\n')

    print(f"  [done] {lang} -> {output_path.relative_to(PROJECT_ROOT)}")


def main() -> None:
    parser = argparse.ArgumentParser(description='Locale message translator')
    parser.add_argument('--lang', type=str, default=None)
    parser.add_argument('--overwrite', action='store_true')
    parser.add_argument('--chunks', type=int, default=12)
    parser.add_argument('--concurrency', type=int, default=6)
    args = parser.parse_args()

    config = load_config()
    en_path = PROJECT_ROOT / config.get('output_dir', 'src/locales/') / 'en.json'
    if not en_path.exists():
        print(f"[FAIL] Missing source locale: {en_path}")
        sys.exit(1)

    with open(en_path, 'r', encoding='utf-8') as handle:
        en_data = json.load(handle)

    if args.lang:
        languages = [item.strip() for item in args.lang.split(',') if item.strip()]
    else:
        languages = config.get('languages', [])

    if not languages:
        print('[FAIL] No target languages configured')
        sys.exit(1)

    lang_names = config.get('lang_names', {})
    print(f"[OK] config: {CONFIG_PATH}")
    print(f"[OK] project: {PROJECT_ROOT}")
    print(f"[OK] languages: {', '.join(languages)}")

    for index, lang in enumerate(languages, start=1):
        print(f"\n[{index}/{len(languages)}] {lang}")
        translate_language(
            lang=lang,
            lang_name=lang_names.get(lang, lang),
            en_data=en_data,
            config=config,
            overwrite=args.overwrite,
            chunk_count=args.chunks,
            concurrency=args.concurrency,
        )


if __name__ == '__main__':
    main()
