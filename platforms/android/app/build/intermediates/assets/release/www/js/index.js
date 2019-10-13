/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
const app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
        this.createController();        
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    createController: function() {
        this._controller = new Controller();
        this._controller.init();        
    },

};

class Button {
    
    constructor(id) {
        this._id = id;

        /**
         * @type {HTMLButtonElement}
         */
        this._element = document.getElementById(id);
    }

    prepare() {

    }

    click() {
        this.prepare();
        this.onClick();
    }

    onClick() {

    }

    release() {

    }
}

class TimeClock {

    constructor() {
        this._isStarted = false;
        this._prev = Date.now();
    }

    /**
     * @param  {Number} elapsed
     */
    update(elapsed) {
        if(this._isStarted) {
            const time = new Date();
            const str = `${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;
            $("#time-value").text(str);
        }

        window.requestAnimationFrame(this.update.bind(this));
       
    }

    start() {
        this._isStarted = true;
        this._prev = Date.now();
    }

    stop() {
        this._isStarted = false;
        app._controller.endRecord( Math.floor((Date.now() - this._prev) / 1000.0) );
        $("#time-value").text("00:00:00");
        this._prev = Date.now();
    }

}

class RecordButton extends Button {

    /**
     * @param  {Function} okCallback This callback function will be executed when pressing the button.
     */
    constructor(okCallback) {
        super('record');
        
        this._element.addEventListener("click", this.click.bind(this), false);
        this._isRelease = false;
        this._okCallback = okCallback;

        this._timeClock = new TimeClock();
        this._timeClock.update();

    }

    prepare() {
        this._element.className = "ui red button";
        this._element.textContent = "기록하기";
    }

    click() {
        this.prepare();

        if(!this._isRelease) {
            this.onClick();
        } else {
            this.release();
        }
    }

    onClick() {
        
        if(this._okCallback) {
            this._okCallback();            
        }

        this._timeClock.start();

        this._element.className = "ui primary button";
        this._element.textContent = "중지";
        this._isRelease = true;

    }

    release() {
        this.prepare();
        this._timeClock.stop();
        this._isRelease = false;
    }

}

class Controller {

    constructor() {

        this._data = [];

        /** 
         * @type {?HTMLDivElement} 
         */
        this._timeList = null;

    }

    init() {        

        // Parsing the data.
        let _tempData = localStorage.getItem('data');
        this._data = [];
        if(_tempData) {
            this._data = JSON.parse(_tempData);
        }

        // Create table.
        this.load();
        
        // Create record button
        this._record = new RecordButton(this.record.bind(this));

        // Create clear button
        const clear =  document.getElementById('clear');
        clear.addEventListener("mousedown", this.clear.bind(this), false);

    }

    load() {
        this._timeList = document.getElementById('timeList');

        if(!this._data) {
            this._data = [];
        }

        this._data.forEach(data => {
            const p = document.createElement('div');
            p.textContent = data;
            this._timeList.appendChild(p);
        });
    }

    clear() {
        this._timeList = document.getElementById('timeList');

        this._record.release();

        while (this._timeList.firstChild) {
            this._timeList.removeChild(this._timeList.firstChild);
        }

        $("input[type=text]").val("");

        localStorage.setItem('data', null);        
        this._data = [];
    }

    getCurrentTime() {
        const time = new Date();

        return `${time.getHours()}시 ${time.getMinutes()}분 ${time.getSeconds()}초`;
    }

    /**
     * @return {HTMLDivElement} div
     */
    createNewElement(text = "") {
        const value = document.getElementById('contents').value;
        const div = document.createElement('div');
        div.className = "description";
        div.textContent = `[${text}] ${this.getCurrentTime()} / ${value}`;

        return div;
    }

    endRecord(text) {
        this._timeList = document.getElementById('timeList');
        const p = this.createNewElement(`종료 - ${text}초 경과`);
        this._data.push(p.textContent);
        this._timeList.appendChild(p);
        localStorage.setItem('data', JSON.stringify(this._data));
    }

    record() {
           
        this._timeList = document.getElementById('timeList');

        const p = this.createNewElement("시작");

        this._data.push(p.textContent);

        this._timeList.appendChild(p);

        localStorage.setItem('data', JSON.stringify(this._data));

    }

}

app.initialize();