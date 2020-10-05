# Unity UPM Semver
 Github Action to handle automated semver modification for Unity UPM packages.

## Inputs

This is the data that you must set up in your own workflow file to use this action properly.

### semver-update-type

When calling this action, you can specify the type of semver update you'd like to perform. Suitable values are:

* major - This increments the first number in a "major.minor.patch" version string
* minor - This increments the second number in a "major.minor.patch" version string
* patch - This increments the third number in a "major.minor.patch" version string

### upm-package-directory

When calling this action, you MUST specify the directory that contains your UPM package & its package.json file. If this directory is incorrectly set, the action will fail.

For example, with `steps` code like this in your Github Actions workflow file:

```yaml
      - name: Checkout "UPM" branch
        uses: actions/checkout@v2
        with:
          ref: upm

      - name: Find UPM package.json & increment its version number
        uses: AlexHolderDeveloper/UnityUPMSemver@v0.0.1 # Change vX.X.X to whatever tag is newer in the AlexHolderDeveloper/UnityUPMSemver repository.
        id: semver-update-upm
        with:
          semver-update-type: 'patch' # Change this string to any suitable string mentioned in the Inputs section of this action's readme to suit your needs.
          upm-package-directory: '/'

```

The branch "upm" [shown is from this repository](https://github.com/AlexHolderDeveloper/BigfootUnityUtilities/tree/upm). It has its `package.json` file in its root. This means that the `upm-package-directory` value can just be a '/'.

Comparison of paths:

* If at a root directory (eg. the "upm" branch [shown here](https://github.com/AlexHolderDeveloper/BigfootUnityUtilities/tree/upm)): /

* If inside a nested folder inside the repository (eg. the master branch [shown here](https://github.com/AlexHolderDeveloper/BigfootUnityUtilities)): `BigfootUnityUtilities/blob/master/Assets/BigfootDS/BigfootUnityUtilities/`



## Outputs 

This is the data that you can use after this action has completed, in other actions & scripts.

### semver-number 

This represents the semantic version string _after_ this action has been performed - it will reflect the new, updated version string.



## Example Usage

In your repository containing a Unity project, you should have a Github Actions workflow file set up in your `.github/workflows` directory. Name it whatever you want (as long as it ends in ".yml"!). After letting this action run, you then have to sort out committing & pushing the changed file(s) to your repo from within the workflow. The example code below shows all of this; it updates the patch number in every push made to the repository. 

Currently, the big downside to this process is that all developers working on the repo must then fetch & pull the changes made by this action. If you or your developers are editing the `package.json` file of your UPM package manually, you may end up with merge conflicts.

The workflow below shows an example of updating the `package.json` file's `version` property on push. It does this to both a UPM branch (because [the example repo](https://github.com/AlexHolderDeveloper/BigfootUnityUtilities) has its UPM package hosted in a specific branch for usage by others in their own Unity projects) and it the master/main branch (for package maintenance & development).

```yaml


name: Update Unity UPM semantic versioning

on: [push]

jobs:
  create:
    name: Update semver in UPM package & project settings
    runs-on: ubuntu-latest
    
    steps:
      # You must ALWAYS checkout your repo so that actions in the workflow can use it.
      - name: Checkout "UPM" branch
        uses: actions/checkout@v2
        with:
          ref: upm

      - name: Find UPM package.json & increment its version number
        uses: AlexHolderDeveloper/UnityUPMSemver@v0.0.1 # Change vX.X.X to whatever tag is newer in the AlexHolderDeveloper/UnityUPMSemver repository.
        id: semver-update-upm
        with:
          semver-update-type: 'patch' # Change this string to any suitable string mentioned in the Inputs section of this action's readme to suit your needs.
          upm-package-directory: '/'

      # Validate that the number has been incremented correctly.
      - name: Get the new semver number
        run: echo "The new semver number for this Unity project is ${{ steps.semver-update-upm.outputs.semver-number }}"

      # Commit & push the updated semver number back into the repo. Yes, you have to fetch & pull in your local workstation after this step is done.
      - name: Push changed files back to repo
        uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: "Updated semver via automated action."
          commit_options: '--no-verify --signoff'
          branch: upm
      
            # You must ALWAYS checkout your repo so that actions in the workflow can use it.
      - name: Checkout "master" branch
        uses: actions/checkout@v2


      - name: Find UPM package.json & increment its version number
        uses: AlexHolderDeveloper/UnityUPMSemver@v0.0.1 # Change vX.X.X to whatever tag is newer in the AlexHolderDeveloper/UnityUPMSemver repository.
        id: semver-update-master
        with:
          semver-update-type: 'patch' # Change this string to any suitable string mentioned in the Inputs section of this action's readme to suit your needs.
          upm-package-directory: '/Assets/BigfootDS/BigfootUnityUtilities/'

      # Validate that the number has been incremented correctly.
      - name: Get the new semver number
        run: echo "The new semver number for this Unity project is ${{ steps.semver-update-master.outputs.semver-number }}"

      # Commit & push the updated semver number back into the repo. Yes, you have to fetch & pull in your local workstation after this step is done.
      - name: Push changed files back to repo
        uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: "Updated semver via automated action."
          commit_options: '--no-verify --signoff'
          branch: master

```

## To-Do List

* General code optimizations
* Create more example workflows