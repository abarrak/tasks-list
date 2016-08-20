// Tasks Board App ..

(function(){

  window.App = {
    Models: {},
    Views: {},
    Collections: {},
    Router: {},
    Events: {}
  };

  var template = function(id) {
    return _.template( $('#' + id).html() );
  };

  var c = 0;
  var inc_counter = function(){ return ++c; };
  var dec_counter = function(){ --c; };

  /**
   * Routes.
   */
  App.Router = Backbone.Router.extend({
    routes: {
      '': 'index',
      'show/:id': 'show'
    },

    index: function () {
    },

    show: function(id) {
      App.Events.Tasks.trigger('task:show', id);
    }
  });

  /**
   * Custom Events.
   */
  App.Events.Tasks = _.extend({}, Backbone.Events);

  /**
   * Models.
   */
  App.Models.Task = Backbone.Model.extend({
    initialize: function () {
        this.set('id', inc_counter());
    },

    validate: function (attrs) {
      if ( !$.trim(attrs.title) )
        return 'A task requires a title.'
    }
  });

  /**
   * Collections.
   */
  App.Collections.Tasks = Backbone.Collection.extend({
    model: App.Models.Task,
    url: '/'
  });

  /**
   * Views.
   */
  App.Views.Task = Backbone.View.extend({
    tagName: 'li',
    template: template('tasksTemplate'),
    events: {
      'click .edit': 'edit',
      'click .delete': 'destroy',
    },

    initialize: function () {
      this.model.on('change', this.render, this);
      this.model.on('destroy', this.remove, this);
    },

    render: function() {
      var compiled = this.template(this.model.toJSON());
      this.$el.html(compiled);
      return this;
    },

    edit: function() {
      this.model.set('title', prompt('New title ? '), { validate: true });
    },

    destroy: function() {
      dec_counter();
      this.model.destroy();
    },

    remove: function () {
      this.$el.remove();
    }
  });

  App.Views.AddTask = Backbone.View.extend({
    el: '#addTask',
    events: {
      'submit' : 'submit'
    },

    initialize: function() {
    },

    submit: function(e){
      e.preventDefault();

      var newTask = {
        title: $(e.currentTarget).find('input[name=title]').val(),
        priority: $(e.currentTarget).find('input[name=priority]').val()
      };

      this.collection.add(newTask, { validate: true });
    }
  });

  App.Views.Tasks = Backbone.View.extend({
    tagName: 'ul',

    initialize: function() {
      this.collection.on('add', this.addOne, this);
      App.Events.Tasks.on('task:show', this.show, this);
    },

    render: function() {
      this.collection.each(this.addOne, this);
      return this;
    },

    addOne: function (task) {
      var taskView = new App.Views.Task({ model: task });
      this.$el.append(taskView.render().el);
    },

    show: function(id) {
      var t = this.collection.at(id - 1);
      if (t)
        alert(t.get('title') + " [" + t.get('priority') + "]");
    }
  });

  // Initialize application.
  var tasks = new App.Collections.Tasks([
    { title: 'First Task !', priority: 'high' },
    { title: 'Summer Trip', priority: 'Medium' },
    { title: 'Ideas Writedown', priority: 'Low' }
  ]);

  var tasksView = new App.Views.Tasks({ collection: tasks });
  var addTaskView = new App.Views.AddTask({ collection: tasks });

  $('#tasks').append(tasksView.render().el);

  new App.Router();
  Backbone.history.start();

})();
