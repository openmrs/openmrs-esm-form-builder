# OpenMRS ESM Form Builder App

The Form Builder is a widget used to create OpenMRS form schemas. It enables users to both create new schemas and edit existing ones. It provides an embedded code editor that accepts JSON code. It also provides an interactive editor where users can construct a schema interactively without writing code.

## Form Builder User Guide

* See the thorough User Guide for the Form Builder here: https://ampath-forms.vercel.app/docs/quickstart
* Prerequisites & dependencies are covered here: https://ampath-forms.vercel.app/docs/developer-guide/run-form-engine-in-openmrs3#prerequisites 

## Running this code
Under the hood, the Form Builder uses the [OHRI form engine](https://www.npmjs.com/package/@ohri/openmrs-ohri-form-engine-lib) to render a visual representation of your schema. This visual preview gets progressively updated as you build your schema. When done building, you can save your schema to an OpenMRS server. You can also publish your schema to make it available to your frontend.

## Local development

```sh
yarn  # Installs dependencies
yarn start  # Launches a dev server
```

Once the dev server launches, log in and select a location. You will get redirected to the home page. Once there, you can either:

- Click the App Switcher icon in the top right corner and then click `Form Builder` to launch the app.
- Manually navigate to the `/openmrs/spa/form-builder` URL.

## Building

```sh
yarn build
```

## Running tests

```sh
yarn test 
```
