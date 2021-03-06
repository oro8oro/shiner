Template.bodyCont.onCreated(function(){
  Session.set('tt', true)
  Session.set('iframeFramework', 'hNyLNW3sAFSuwPR8L') //semantic
  this.app = new ReactiveVar();
  this.page = new ReactiveVar();
})

delta = 10

setWin = function(offset) {
  var win = Session.get('window')
  win.w = window.innerWidth
  win.h = window.innerHeight
  if(offset)
    win.offset = offset;
  if(win.offset)
    win.iw = win.w - win.offset - delta
  Session.set("window", win);
}

Template.bodyCont.onRendered(function(){
  var offset = 150
  Session.set("window", {w: window.innerWidth, h: window.innerHeight, iw: window.innerWidth - offset - delta, offset: offset})
  $("#splitter").zinoSplitter({
        panes: [
            {size: offset}, 
            { region: "east"}
        ],
        resize: function (ev, ui) {
          setWin($('.zui-splitter-separator').position().left);
        }
    });

  $(window).resize(function(evt) {
    setWin();
  });

  $('body').addClass('shiner-dark')
})


Template.bodyCont.helpers({
  fr: function() {
    return Session.get('iframeFramework')
  },
  appname: function() {
    return FlowRouter.getParam('app') || Template.instance().app.get()
  },
  page: function() {
    return FlowRouter.getParam('page') || Template.instance().page.get()
  },
  builder: function() {
    return FlowRouter.getParam('page')
  },
  iwidth: function() {
    var win = Session.get('window')
    if(win)
      return win.iw
  },
  iheight: function() {
    var win = Session.get('window')
    if(win)
      return win.h
  },
  apps: function() {
    var pages = Pages.find().fetch()
    var apps = [], app
    _.each(_.groupBy(pages, 'app'), function(pages, app) {
      apps.push({name: app, children: pages, hasChildren: true})
    })
    if(apps.length && !Template.instance().page.get()) {
      Template.instance().app.set(apps[0].name)
      Template.instance().page.set(apps[0].children[0].name)
    }
    return apps
  },
  children: function(){
    var templates = buildMap(Session.get('frameworkRoot'))
    return templates.children
  }
})

Template.bodyCont.events({
  "click #addTT": function(ev, inst){
    Session.set('tt', "template")
    $("#modal").modal("show")
  },
  "click #addF": function(ev, inst){
    Session.set('tt', "framework")
    $("#modal").modal("show")
  },
  "click #editForm": function(ev, inst) {
    window.open('/form', '_blank')
  },
  "click .sh-item": function(ev , inst){
    if(!$(ev.target).is('span'))
      return
    ev.stopPropagation();
    if(FlowRouter.getParam('page')) {
      seeThem(ev.currentTarget.id)
      //$('#secSide').sidebar('show')
    }
    else {
      if(this.app) {
        inst.app.set(this.app)
        inst.page.set(this.name)
      }
      else
        inst.app.set(this.name)
    }
  },
  "click .toPage": function(ev, inst) {
    window.open('/app/' + this.app + '/' + this.name, '_blank')
  },
  "click .delPage": function(ev, inst) {
    Meteor.call('deletePage', this._id);
  },
  "click .delApp": function(ev, inst) {
    Meteor.call('deleteApp', this.name);
  },
  "click .addPage": function(ev, inst) {
    Meteor.call('insertPage', {app: this.name, name: 'page_' + makeid(3)});
  },
  "click .addApp": function(ev, inst) {
    Meteor.call('insertPage', {app: 'app_' + makeid(3), name: 'page_' + makeid(3)});
  }
})

Template.modaladd.helpers({
  tt: function(){
    return Session.get('tt')
  },
  equals: function(v1, v2){
    if (v1 == v2) return true;
    return false;
  }
})

Template.listFrameworks.helpers({
  frameworks: function(){
    var framew = Frameworks.find({}).fetch()
    if(framew.length > 0) {
      var frames = document.getElementsByTagName('iframe')
      if(frames.length > 0) {
        var obj = {
           framework: $('#frameSel').val()
        };
        setIFrame(obj)
        Session.set('iframeFramework', $('#frameSel').val())
      }
      Session.set('frameworkRoot', framew[0].root)
    }
    return framew
  }
})

Template.listFrameworks.events({
  "change #frameSel": function(ev, inst){
    ev.stopPropagation();
    var obj = {
       framework: inst.$('#frameSel').val()
    };
    setIFrame(obj)
    Session.set('iframeFramework', $('#frameSel').val())
    Session.set('frameworkRoot', inst.$(ev.currentTarget).find('option:selected').data('root'))
  }
})




Template.listTemplates.helpers({
  showbtn: function() {
    if(!FlowRouter.getParam('page'))
      return true
    return false
  }
})