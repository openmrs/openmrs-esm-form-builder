## Requirements

- [ ] This PR has a title that briefly describes the work done including the ticket number. If there is a ticket, make sure your PR title includes a [conventional commit](https://o3-docs.openmrs.org/docs/frontend-modules/contributing.en-US#contributing-guidelines) label. See existing PR titles for inspiration.
- [ ] My work conforms to the [OpenMRS 3.0 Styleguide](https://om.rs/styleguide) and [design documentation](https://om.rs/o3ui).
- [ ] My work includes tests or is validated by existing tests.

## Summary
<!-- Please describe what problems your PR addresses. -->

## Screenshots
<!-- Required if you are making UI changes. -->

## Related Issue
<!-- Paste the link to the Jira ticket here if one exists. -->
<!-- https://issues.openmrs.org/browse/O3- -->

## Other
<!-- Anything not covered above -->

```js
name: PR Title Checker

on:
  pull_request:
    types: [opened, edited, reopened, synchronize]

jobs:
  check-title:
    runs-on: ubuntu-latest
    steps:
      - name: Check PR Title Format
        uses: amannn/action-semantic-pull-request@v5
        with:
          types: |
            docs
            test
            chore
            fix
            feat
            refactor
            BREAKING
          requireScope: false
          headerPattern: "^(?:(?<type>BREAKING|docs|test|chore|fix|feat)(?:\\(.*\\))?:? )?(?:(?<ticket>O3-[0-9]+): )?(?<subject>.*)$"
          headerPatternCorrespondence: type,ticket,subject
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```
