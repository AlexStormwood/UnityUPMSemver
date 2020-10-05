const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
const resolve = require('path').resolve;

function containsAllStringsFromAnotherArray(arrayToCheck, arrayWithRequiredValues){
    return arrayWithRequiredValues.every(item => arrayToCheck.includes(item.toLowerCase()));
}

const upmRequiredDirectories = [
    "editor",
    "runtime",
    "tests",
    "documentation"
]

async function modifyUnityUPMSemver() {
    // 1. Get root UPM directory path from inputs
    var upmRootPath = core.getInput('upm-package-directory');

    // 2. Verify that the directory contains the standardized UPM directory structure (optional?)
    let actionRunnerDir = process.env.GITHUB_WORKSPACE;
    actionRunnerDir += upmRootPath;
    actionRunnerDir = resolve(actionRunnerDir);
    console.log("Working from this directory for the UPM root directory: \n" + actionRunnerDir);

    let directoriesInUPMRoot = []; 
    directoriesInUPMRoot = fs.readdirSync(actionRunnerDir, { withFileTypes: true})
    .filter(potentialDirectory => potentialDirectory.isDirectory())
    .map(confirmedDirectory => confirmedDirectory.name.toLowerCase());

    console.log("Directories found in the UPM directory set in the inputs:")
    console.log(directoriesInUPMRoot);

    if (containsAllStringsFromAnotherArray(directoriesInUPMRoot, upmRequiredDirectories)){
        console.log("All root-level UPM directories required by Unity's UPM structure are found!")
    } else {
        throw("UPM directory does not contain the expected folders! Check out the documentation for more info: https://docs.unity3d.com/Manual/cus-layout.html");
    }

    // 3. Verify that the directory contains a package.json file
    let rawPackageDotJSON = fs.readFileSync(actionRunnerDir + "/package.json");
    let loadedPackageDotJSON = JSON.parse(rawPackageDotJSON);

    // 4. Read the current "version" property of the package.json file 
    if (loadedPackageDotJSON.version == null || loadedPackageDotJSON.version == undefined){
        throw("No valid version property found in the package.json for the UPM package! Check out the documentation for more info: https://docs.unity3d.com/Manual/upm-manifestPkg.html");
    } 

    // 5. Parse the "version" string into separate numbers for better manipulation
    let versionStringSplit = loadedPackageDotJSON.version.split(".");
    let versionAsObj = {
        major: parseInt(versionStringSplit[0]),
        minor: parseInt(versionStringSplit[1]),
        patch: parseInt(versionStringSplit[2])
    };
    console.log("Detected existing semver as: " + JSON.stringify(versionAsObj));

    // 6. Get the semver update type from inputs 
    var semverUpdateType = core.getInput('semver-update-type').toLowerCase();
    console.log("core.getInput('semver-update-type').toLowerCase() ----------------->" + semverUpdateType)

    // 7. Modify relevant semver numbers based on semver update type
    switch (semverUpdateType) {
        case "patch":
            console.log("yep, was a patch!");
            versionAsObj.patch++;
            break;
        case "minor":
            console.log("we did a minor update!");
            versionAsObj.minor++;
            versionAsObj.patch = 0;
            break;
        case "major":
            console.log("MAJOR version update omg!");
            versionAsObj.major++;
            versionAsObj.minor = 0;
            versionAsObj.patch = 0;
            break;
        default:
            break;
    }

    console.log(`Semver is now: ${JSON.stringify(versionAsObj)}`);

    // 8. Convert semver obj back into string
    let newSemverAsString = `${versionAsObj.major}.${versionAsObj.minor}.${versionAsObj.patch}`;

    // 9. Write string back into package.json
    loadedPackageDotJSON.version = newSemverAsString;
    fs.writeFileSync(actionRunnerDir + "/package.json", JSON.stringify(loadedPackageDotJSON, null, "\t"), (error) => {
        if (error){
            throw("Something went wrong when writing our updated package.json back to a file. Error: \n" + error)
        } else {
            console.log("File write was a success!");
        }
    });
    // 10. Return the new semver string to outputs
    core.setOutput("semver-number", newSemverAsString)

}

modifyUnityUPMSemver()
.catch(error => {
    console.log("Function threw on an error: \n" + error)
    return error;
})