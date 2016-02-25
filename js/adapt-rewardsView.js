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
            var score = 0;
            if (this.isExternallyUpdated) score = setScore;
            else score = this.collection.where({_isCorrect: true}).length;
            var data = this.collection.toJSON();
            var template = Handlebars.templates['rewards'];
            this.$el.html(template({
                score: score, 
                rewards:data
            }));

            // Add icon to button
            this.$('.rewards-button').addClass(Adapt.course.get('_rewards')._icon);
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
                body: rewardsPromptModel.body,
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