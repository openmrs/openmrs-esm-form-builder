# OpenMRS ESM Form Builder App

![OpenMRS CI](https://github.com/openmrs/openmrs-esm-form-builder/actions/workflows/node.js.yml/badge.svg)

The Form Builder is a widget used to create OpenMRS form schemas. It enables users to both create new schemas and edit existing ones. It provides an embedded code editor that accepts JSON code. It also provides an interactive editor where users can construct a schema interactively without writing code.

## Form Builder User Guide

* See the thorough User Guide for the Form Builder here: <https://ampath-forms.vercel.app/docs/quickstart>
* Prerequisites & dependencies are covered here: <https://ampath-forms.vercel.app/docs/developer-guide/run-form-engine-in-openmrs3#prerequisites>

## Running this code

Under the hood, the Form Builder uses the [OHRI form engine](https://www.npmjs.com/package/@openmrs/openmrs-form-engine-lib) to render a visual representation of your schema. This visual preview gets progressively updated as you build your schema. When done building, you can save your schema to an OpenMRS server. You can also publish your schema to make it available to your frontend.

To set up environment variables for the project, follow these steps:

1. Create a copy of the .env.example file by running the following command:

    ```bash
    cp example.env .env
    ```

2. Open the newly created .env file in the root of the project.

3. Add the environment variables you need.

Note: These variables are currently only used for end-to-end tests.

## Local development

```sh
yarn  # Installs dependencies
yarn start  # Launches a dev server
```

Once the dev server launches, log in and select a location. You will get redirected to the home page. Once there, you can either:

* Click the App Switcher icon in the top right corner and then click the `System Administration` link to go the Admin page. Click on the `Form Builder` tile to launch the app.
* Manually navigate to the `/openmrs/spa/form-builder` URL.

## Running tests

### Unit tests

To run tests for all packages, run:

```bash
yarn turbo run test
```

To run tests in `watch` mode, run:

```bash
yarn turbo run test:watch
```

To run a specific test file, run:

```bash
yarn turbo run test -- dashboard
```

The above command will only run tests in the file or files that match the provided string.

You can also run the matching tests from above in watch mode by running:

```bash
yarn turbo run test:watch -- dashboard
```

To generate a `coverage` report, run:

```bash
yarn turbo run coverage
```

By default, `turbo` will cache test runs. This means that re-running tests wihout changing any of the related files will return the cached logs from the last run. To bypass the cache, run tests with the `force` flag, as follows:

```bash
yarn turbo run test --force
```

### E2E tests

To run E2E tests, make sure the dev server is running by using:

```sh
yarn start
```

Then, in a separate terminal, run:

```sh
yarn test-e2e --headed
```

Read the [e2e testing guide](/e2e/README.md) to learn more about End-to-End tests in this project.

#### Troubleshooting

If you can't debug tests in [UI mode](https://playwright.dev/docs/test-ui-mode) because your local web server reloads due to static file changes, use the [Playwright Inspector](https://playwright.dev/docs/running-tests#debug-tests-with-the-playwright-inspector) instead. Run the following command:

```sh
yarn test-e2e --headed --debug
```

This approach should avoid issues caused by Webpack and static file changes.

## Building

```sh
yarn turbo run build
```
