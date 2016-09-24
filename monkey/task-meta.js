/**
 * Created by kangtian on 16/9/20.
 */

var AV = require('../lib/tab-login');
var TabUtil = require('../lib/tab-util');
var MonkeyEvent = require('./monkey-event');


function sync_task_meta(event_records) {
    if (event_records.length == 0)
        return;
    for (var i = 0; i < event_records.length; i ++){
        var r = event_records[i];
        setTimeout(function (r) {
            sync_one_event_record(r);
        }, i * 10, r);
    }
}

function sync_one_event_record(r) {
    var TaskMeta = AV.Object.extend('TaskMeta');
    var task_meta_query = new AV.Query('TaskMeta')
        .equalTo('task_id', r.get('task_id'));
    TabUtil.find(task_meta_query, function (records) {
        var task_meta;
        if (records.length == 0){
            task_meta = new TaskMeta();
            task_meta.set('task_id', r.get('task_id'));
            task_meta.set('product', r.get('product'));
            task_meta.set('version', r.get('version'));
            task_meta.set('device', r.get('device'));
            task_meta.set('status', r.get('status'));
            task_meta.set('start_time', new Date());
            task_meta.set('last_time', new Date());
            task_meta.addUnique('activity_list', r.get('pre_activity'));
            task_meta.addUnique('widget_list', MonkeyEvent.get_event_entity_identify(r));
            task_meta.addUnique('event_list', MonkeyEvent.get_event_identify(r));
            TabUtil.save(task_meta);
        } else {
            task_meta = records[0];
            task_meta.set('status', r.get('status'));
            task_meta.set('last_time', new Date());
            task_meta.addUnique('activity_list', r.get('pre_activity'));
            task_meta.addUnique('widget_list', MonkeyEvent.get_event_entity_identify(r));
            task_meta.addUnique('event_list', MonkeyEvent.get_event_identify(r));
            TabUtil.save(task_meta);
        }
    }, function (error) {
        console.error(error)
    });
}

var EnumMeta = {
    sync_task_meta: sync_task_meta,
    sync_one_event_record: sync_one_event_record
};


module.exports = EnumMeta;
