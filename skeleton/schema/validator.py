#!/usr/bin/env python3
"""
SkeleTeller Storyboard Validator

Validates a storyboard YAML file against the JSON Schema.
"""

import sys
import json
from pathlib import Path
import yaml
from jsonschema import validate, ValidationError, SchemaError


def load_schema():
    """Load the storyboard JSON schema."""
    schema_path = Path(__file__).parent / "storyboard.schema.json"
    with open(schema_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def load_storyboard(storyboard_path):
    """Load and parse a storyboard YAML file."""
    path = Path(storyboard_path)
    if not path.exists():
        raise FileNotFoundError(f"Storyboard file not found: {storyboard_path}")
    
    with open(path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)


def validate_storyboard(storyboard_path, verbose=True):
    """
    Validate a storyboard file against the schema.
    
    Args:
        storyboard_path: Path to the storyboard YAML file
        verbose: Print detailed validation messages
    
    Returns:
        bool: True if valid, False otherwise
    """
    try:
        schema = load_schema()
        storyboard = load_storyboard(storyboard_path)
        
        # Validate against schema
        validate(instance=storyboard, schema=schema)
        
        # Additional validation: check that total_duration matches sum of scenes
        if 'metadata' in storyboard and 'total_duration' in storyboard['metadata']:
            declared_duration = storyboard['metadata']['total_duration']
            actual_duration = sum(scene['duration'] for scene in storyboard['scenes'])
            
            if abs(declared_duration - actual_duration) > 0.1:
                if verbose:
                    print(f"⚠️  Warning: metadata.total_duration ({declared_duration}s) "
                          f"doesn't match sum of scene durations ({actual_duration}s)")
        
        # Additional validation: check asset paths exist (relative to storyboard)
        storyboard_dir = Path(storyboard_path).parent
        missing_assets = []
        
        for i, scene in enumerate(storyboard['scenes']):
            # Check visual field
            if 'visual' in scene:
                asset_path = storyboard_dir / scene['visual']
                if not asset_path.exists():
                    missing_assets.append((i + 1, scene['type'], scene['visual']))
            
            # Check background field (title scenes)
            if scene['type'] == 'title' and 'background' in scene:
                asset_path = storyboard_dir / scene['background']
                if not asset_path.exists():
                    missing_assets.append((i + 1, 'title', scene['background']))
        
        if missing_assets:
            if verbose:
                print(f"⚠️  Warning: {len(missing_assets)} asset(s) not found:")
                for scene_num, scene_type, asset in missing_assets:
                    print(f"   Scene {scene_num} ({scene_type}): {asset}")
        
        if verbose:
            scene_count = len(storyboard['scenes'])
            total_dur = sum(scene['duration'] for scene in storyboard['scenes'])
            print(f"✅ Storyboard is valid!")
            print(f"   Project: {storyboard['project']['name']}")
            print(f"   Scenes: {scene_count}")
            print(f"   Total duration: {total_dur}s")
            if missing_assets:
                print(f"   Note: Validation passed, but {len(missing_assets)} asset(s) missing")
        
        return True
        
    except FileNotFoundError as e:
        if verbose:
            print(f"❌ Error: {e}")
        return False
    
    except yaml.YAMLError as e:
        if verbose:
            print(f"❌ YAML parsing error: {e}")
        return False
    
    except ValidationError as e:
        if verbose:
            print(f"❌ Validation error: {e.message}")
            if e.path:
                path_str = '.'.join(str(p) for p in e.path)
                print(f"   At: {path_str}")
        return False
    
    except SchemaError as e:
        if verbose:
            print(f"❌ Schema error: {e}")
        return False
    
    except Exception as e:
        if verbose:
            print(f"❌ Unexpected error: {e}")
        return False


def main():
    """Command-line interface."""
    if len(sys.argv) < 2:
        print("Usage: python validator.py <storyboard.yml>")
        print("\nValidates a SkeleTeller storyboard file against the schema.")
        sys.exit(1)
    
    storyboard_path = sys.argv[1]
    is_valid = validate_storyboard(storyboard_path, verbose=True)
    
    sys.exit(0 if is_valid else 1)


if __name__ == "__main__":
    main()
