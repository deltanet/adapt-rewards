define(function(require) {

    var Adapt = require('coreJS/adapt');
    var RewardsView = require('extensions/adapt-rewards/js/adapt-rewardsView');

    var questionComponents;
    var isExternallyUpdated = false;

    Adapt.on('app:dataReady', function() {

        var Rewards = Adapt.course.get('_rewards');

        if (Rewards && Rewards._isEnabled) {
            // If rewards is enabled - filter question components into a collection
            questionComponents = new Backbone.Collection(Adapt.components.where({_isQuestionType: true}));

            if (Rewards._isExternallyUpdated) {
                isExternallyUpdated = true;
            }
            // Only setup navigation event listener if rewards is enabled
            setupNavigationEvent();

        }
        
        if (isExternallyUpdated) {
	        var diffuseAssessment = Adapt.course.get('_diffuseAssessment');
	        if (diffuseAssessment && diffuseAssessment._isEnabled === true) {
	            Adapt.on("diffuseAssessment:assessmentCalculate diffuseAssessment:assessmentComplete", function(assessment) {
	                Adapt.trigger("rewards:set",assessment._currentPoints);
	            });
	        }
	    }

    });

    function setupNavigationEvent() {

        Adapt.on('navigationView:postRender', function(navigationView) {
            navigationView.$('.navigation-inner').append(new RewardsView({
                isExternallyUpdated: isExternallyUpdated,
                collection: questionComponents
            }).$el);
        });

    }

});