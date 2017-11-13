import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as _ from 'lodash';
import * as slackNotify from './slackNotify';

const conf = yaml.load(fs.readFileSync('config.yml'));

const gitlabUrl = conf.gitlab.url;
const gitlabToken = conf.gitlab.token;

/**
 * Initiating GitLab api library with properties contained in the config.yml file.
 */
const GitlabAPI = require('node-gitlab-api')({
    url: gitlabUrl,
    token: gitlabToken
});

export const GitlabService = {

    /**
     * Verify the list of gitlab projects IDs and their MR List, warning users of
     * MRs with merge problems.
     * @param gitlabProjectsID List of gitlab projects IDs to be verified. If the list
     * is empty all the projects IDs are used. IDs acquired with the getAllProjectsID function.
     */
    verifyAndWarnMRProblems: async function(gitlabProjectsID){
        if(_.isEmpty(gitlabProjectsID)) gitlabProjectsID = await getAllProjectsID();
        const MRMap = await createMapAuthorToMRFromGitlab(gitlabProjectsID);

        _.forIn(MRMap, (MRList, user) => {
            slackNotify.mergeRequestUpdateMessage(MRList, user);
        });
    }
};

/**
 * Uses the GitLab API to retrieve the MR List and uses the following filters:
 *  - MRs that are not Work In Progress (WIP)
 *  - MRs with merge_status: "cannot_be_merge" OR "unchecked"
 * @param projectId Project ID which will be used to retrieve the MR list.
 * @returns {Promise.<Array>} List of MRs filtered.
 */
const getMergeRequestFromProject = async function (projectId) {
    let mergeRequests = await GitlabAPI.projects.merge_requests.list(projectId, {state: "opened"});
    return _.filter(mergeRequests, (MR) =>
        (MR.merge_status === "unchecked" || MR.merge_status === "cannot_be_merged")
        && !MR.work_in_progress);
};

/**
 * Gets all projects IDs using the GitLab API.
 * @returns {Promise.<Array>} Array containing the project IDs
 */
const getAllProjectsID = async function () {
    const projectsList = await GitlabAPI.projects.all();
    return _.map(projectsList, (project) => project.id);
};

/**
 * Receives a list of project IDs, retrieve the MRs of the projects and verify which ones
 * can't be merged and are not a work in progress (WIP). Returns a map<User, MRList> of Users
 * to List of MRs with problems.
 * @param projectIdList
 * @returns {Promise.<{}>} Object where each property name is a username and each value is a list of MRs
 * with problems.
 */
const createMapAuthorToMRFromGitlab = async function (projectIdList) {
    const mapAuthorToMR = {};

    for (const projectId of projectIdList) {
        const MRs = await getMergeRequestFromProject(projectId);
        for (const MR of MRs) {
            const author = MR.author.username;
            const MRurl = MR.web_url;
            if (_.isUndefined(mapAuthorToMR[author])) {
                mapAuthorToMR[author] = [];
            }
            mapAuthorToMR[author].push(MRurl);
        }
    }
    return mapAuthorToMR;
};