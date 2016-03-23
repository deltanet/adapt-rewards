define(function(require) {

    var Adapt = require('coreJS/adapt');
    var Backbone = require('backbone');

    var RewardsView = Backbone.View.extend({

        className: 'rewards',

        initialize: function(options) {
            this.isExternallyUpdated = options.isExternallyUpdated;
            if (this.isExternallyUpdated) {
                this.listenTo(Adapt, 'rewards:set', this.render);
            } else {
                this.listenTo(this.collection, 'change:_isCorrect', this.render);
            }
            this.render();
        },

        events: {
            "click .rewards-button":"openPrompt"
        },

        render: function(setScore) {
            // Set vars for use with the body text
            var score = 0;
            var numQuestions = this.collection.length;
            
            if(Adapt.course.get('_rewards')._countDown) {
                score = this.collection.length;
            }
            // If countdown is enabled
            if(Adapt.course.get('_rewards')._countDown) {
                // If the counter is to countdown when a question is correct
                if(Adapt.course.get('_rewards')._trackCorrect) {
                    score = score - (this.collection.where({_isCorrect: true}).length);
                } else {
                    // If the counter is to countdown when a question is incorrect
                    score = score - (this.collection.where({_isCorrect: false}).length);
                }
            } else {
                // If countdown is NOT enabled just total up the number of correct answers

                // If the counter is to countdown when a question is correct
                if(Adapt.course.get('_rewards')._trackCorrect) {
                    score = this.collection.where({_isCorrect: true}).length;
                } else {
                    // If the counter is to countdown when a question is incorrect
                    score = this.collection.where({_isCorrect: false}).length;
                }

            }

            var data = this.collection.toJSON();
            var template = Handlebars.templates['rewards'];
            this.$el.html(template({
                score: score,
                rewards:data
            }));

            // Add icon to button
            this.$('.rewards-button').addClass(Adapt.course.get('_rewards')._icon);

            var str = Adapt.course.get('_rewards')._prompt.body;
            this.feedbackBody = str.replace(/{{{score}}}/g, score);
            this.feedbackBody = this.feedbackBody.replace(/{{{maxScore}}}/g, numQuestions);

        },

        openPrompt: function() {
            var rewardsPromptModel = Adapt.course.get('_rewards')._prompt;

            if (!rewardsPromptModel._buttons) {
                rewardsPromptModel._buttons = {
                    close: "Continue"
                };
            }
            if (!rewardsPromptModel._buttons.cancel) rewardsPromptModel._buttons.cancel = "Continue";

            this.listenToOnce(Adapt, "rewards:cancel", this.cancelPrompt);

            var promptObject = {
                header: rewardsPromptModel._graphic.src,
                title: rewardsPromptModel.title,
                body: this.feedbackBody,
                _prompts:[
                    {
                        promptText: rewardsPromptModel._buttons.cancel,
                        _callbackEvent: "rewards:cancel"
                    }
                ],
                _showIcon: false
            }

            Adapt.trigger('notify:prompt', promptObject);

            $('.notify-popup-body-inner').css('text-align','center');
            
        },

        cancelPrompt: function() {
            this.stopListening(Adapt, "rewards:cancel");
        }

    });

    return RewardsView;

});