(function() {
    'use strict';

    angular.module('BlurAdmin.pages.project')
        .controller('projectsSummaryCtl', projectsSummaryCtl);
    /** @ngInject */
    function projectsSummaryCtl($state, projectInfo, $timeout) {
        var self = this;
        this.createProject = function() {
            //collect projectinf from modal,send by projectInfo;
            var project = {};
            projectInfo.createProject(project).then(
                function() { $state.go("projects.infos") }
            );
        };
        this.openProject = function(projectSummary) {
            projectInfo.openProject(projectSummary);

        };
        projectInfo.allUserProjectsSummary()
            .then(function(summaries) {
                self.projectsSummary = summaries;
            });
    }

})();