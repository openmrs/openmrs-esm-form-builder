## 1.0.0 (2023-01-13)

### Features

* (feat) Landing page UI tweaks by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/13
* (feat) Move error rendering logic to components by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/16
* (feat) Add breadcrumbs navigation by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/18
* (feat) Reorganise routing by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/22
* (feat) Improvements to the forms dashboard by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/28
* (feat) Use props instead of context for state management by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/25
* (feat) Improvements to the form publishing workflow by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/27
* (feat) Improvements to the form renderer by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/30
* (feat) Improvements to the form editor UI by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/31
* (feat) Schema editor UI improvements by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/32
* (feat) Interactive schema builder by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/34
* (feat) Editor mode by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/35
* (feat) Change breadcrumbs menu background color by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/48
* (feat) Resolve concept names from UUIDs when editing questions by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/47
* (feat) Make embedded editor react to schema changes by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/49
* (feat) Display indent guides in schema editor by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/52
* (feat) Add the ability to delete schema properties interactively by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/53
* (feat) Add the ability to duplicate questions by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/54
* (feat) O3-1337: Initialise the project environment by @kumuditha-udayanga in https://github.com/openmrs/openmrs-esm-form-builder/pull/1
* (feat) O3-1383 Implement the Dashboard component by @kumuditha-udayanga in https://github.com/openmrs/openmrs-esm-form-builder/pull/2
* (feat) O3-1438: Implement the Schema Editor Component by @kumuditha-udayanga in https://github.com/openmrs/openmrs-esm-form-builder/pull/3
* (feat) Implement save form feature by @kumuditha-udayanga in https://github.com/openmrs/openmrs-esm-form-builder/pull/4
* (feat) O3-1500: Implement interactive form-builder component by @kumuditha-udayanga in https://github.com/openmrs/openmrs-esm-form-builder/pull/5
* (feat) O3-1524: Implement form viewer component by @kumuditha-udayanga in https://github.com/openmrs/openmrs-esm-form-builder/pull/6

### Fixes

* (fix) Amend patientUuid config property by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/29
* (fix) Remove POC prefix requirement and modify useForm hook by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/40
* (fix) Fix forms list filtering by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/44
* (fix) Fix ace editor console warnings by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/46
* (fix) Fix styling of the error message container by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/51

### Documentation

* (docs) README enhancements by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/50

### Refactors

* (refactor) Reorganise and rename components by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/26
* (refactor) Code improvements by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/33
* (refactor) Move hooks into their own directory by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/15
* (refactor) Refactor useFormClobdata hook by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/19
* (refactor) Refactor useFormMetadata hook by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/20
* (refactor) Remove some unused code by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/42

### Housekeeping

* (chore) adds-form-builder-to-app-menu by @pirupius in https://github.com/openmrs/openmrs-esm-form-builder/pull/7
* (chore) Update versions featuring Carbon v11 by @pirupius in https://github.com/openmrs/openmrs-esm-form-builder/pull/8
* (chore) Configure ESLint rules for carbon and lodash imports by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/11
* (chore) Upgrade yarn to v3 by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/9
* (chore) Bump dependencies by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/12
* (chore) Bump dependencies by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/14
* (chore) Add Turborepo by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/21
* (chore) Move Git hooks into husky dir by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/24
* (chore) Monitor bundle sizes using compressed-size-action by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/23
* (chore) Bump dependencies by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/37
* (chore) Fix pre-release and deploy jobs by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/36
* (chore) Install version plugin by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/38
* (chore) Use lerna for versioning by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/39
* (chore) Automatically extract translation strings by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/17
* (chore) Revert to standard pre-release approach by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/41
* (chore) Fixed issue with yarn pack ignoring dist by @FlorianRappl in https://github.com/openmrs/openmrs-esm-form-builder/pull/43
* (test) Add tests for the Dashboard component by @denniskigen in https://github.com/openmrs/openmrs-esm-form-builder/pull/45