# Contributing

Bug reports and focused pull requests are welcome. For larger changes, open an
issue first so we can agree on the behavior.

## Run locally

Use Node 22 and BB 0.46 or newer.

```sh
npm ci
npm run check
npm test
npm run build
bb plugin install .
```

After changing selectors or styles, try the control in a real BB window: a
long conversation, a narrow pane, the message box, and light and dark
appearance. Check that the sidebar and header do not change size.

## Scope

This plugin resizes chat text and nothing else. Themes, fonts and whole-app
zoom belong in other plugins.
