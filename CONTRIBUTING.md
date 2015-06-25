# Contributing

1. Fork the repo
2. `git clone git@github.com:[yourname]/turbine && cd turbine && npm i`
3. Work your magic...
4. Be sure you have no linting warnings/errors and tests pass.
5. Push and open a pull request.

### Linting

```sh
npm run lint
```

*Note:* It's recommended to install eslint plugin into your [code editor](http://eslint.org/docs/user-guide/integrations.html).

### Testing

```sh
npm test
```

or continuously

```sh
npm i -g karma-cli
karma start
```

## Release

1. Modify `version` in `package.json`
2. `git add package.json`
3. `git commit -m 'Release vX.Y.Z'`
4. `git tag -a vX.Y.Z -m 'Version X.Y.Z'`
5. `git push origin --tags`
6. `npm publish`
