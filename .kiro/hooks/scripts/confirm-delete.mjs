// PreToolUse hook body for delete_file: ask the user before any file is deleted.
// Written as a script so the JSON reaches Kiro intact in every shell.
process.stdout.write(
  JSON.stringify({
    hookSpecificOutput: {
      permissionDecision: 'ask',
      permissionDecisionReason: 'This will delete a file. Confirm you want to proceed.',
    },
  }) + '\n',
);
