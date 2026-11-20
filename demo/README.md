# demo/

Your project's storyboard lives here. Both apps build from this folder only.

- `storyboard.yml`: the storyboard. Kiro drafts it from your project, then you trim it by hand.
- `assets/`: the screenshots it references, copied in by Kiro.

To create it, ask Kiro to draft a storyboard from your project's folder or GitHub
URL. See `skeleton/README.md`. Check it with:

```bash
npm run validate -- demo/storyboard.yml
```

For a working example, see `skeleton/examples/sample-project.yml`.
