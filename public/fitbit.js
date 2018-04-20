$(function _initInterfaceStats() {
    /* 1. make an API request to get the Fitbit heart rate data based on the user current date and time
     *    (if the request fails generate and display random data otherwise go to 2.)
     * 2. find the first data to use from the set
     * 3. update the interface
     * 4. calculate the time gap between the current data and the next one then set a timeout callback to 2. to
     *    wait until the next data to read, if there is no next data go to point 1.
     */
    function Iterator(data) {
      var _currentIndex = 0;
  
      function next() {
        if (hasNext()) {
          return data[++_currentIndex];
        }
  
        return null;
      }
  
      function previous() {
        if (hasPrevious()) {
          return data[--_currentIndex];
        }
  
        return null;
      }
  
      function hasPrevious() {
        return ((_currentIndex - 1) >= data.length);
      }
  
      function hasNext() {
        return ((_currentIndex + 1) < data.length);
      }
  
      function current() {
        return data[_currentIndex];
      }
  
      function first() {
        _currentIndex = 0;
        return data[_currentIndex];
      }
  
      function last() {
        _currentIndex = data.length - 1;
        return data[_currentIndex];
      }
  
      return {
        first: first,
        next: next,
        previous: previous,
        current: current,
        last: last,
        hasNext: hasNext,
        hasPrevious: hasPrevious
      }
    };
  
    var heartModule = function() {
      var data, iterator = null,
        cache = [],
        graphMaxHeight = 27;
  
      function randomHeartBeat() {
        return Math.floor(Math.random() * 70) + 50;
      }
  
      function randomRefreshGap() {
        return Math.floor(Math.random() * 8) + 3;
      }
  
      function calcSecondsPerBeat(heartBeats) {
        return Math.floor((60 / heartBeats) * 100) / 100;
      }
  
      function calcRefreshGap(firstTime, secondTime) {
        var firstDate = new Date();
        var tmpFirstTime = firstTime.split(":");
        firstDate.setHours(tmpFirstTime[0]);
        firstDate.setMinutes(tmpFirstTime[1]);
        firstDate.setSeconds(tmpFirstTime[2]);
  
        var secondDate = new Date();
        var tmpSecondTime = secondTime.split(":");
        secondDate.setHours(tmpSecondTime[0]);
        secondDate.setMinutes(tmpSecondTime[1]);
        secondDate.setSeconds(tmpSecondTime[2]);
  
        return ((secondDate - firstDate) / 1000);
      }
  
      function updateInterface(heartBeats) {
        $('.icon-heart').css("animation-duration", calcSecondsPerBeat(heartBeats) + "s");
        $('.value-heart').text(heartBeats);
  
        pushCache(heartBeats);
        // 27 : 1 = currentMaxHeartBeat : x
        var currentMaxHeartBeat = getCurrentMaxHeartBeat();
        var rate = Math.ceil((currentMaxHeartBeat / 27) * 1000) / 1000;
        updateHeartGraphInterface(rate);
      }
  
      function getCurrentMaxHeartBeat() {
        var tmpCache = [];
        for (var i = 0; i < cache.length; i++) {
          tmpCache.push(cache[i].value);
        }
  
        return Math.max.apply(null, tmpCache);
      }
  
      function updateHeartGraphInterface(rate) {
        var handler = $('.graph-heart polyline');
  
        var rawPoints = "0,27 6,27";
        for (var i = 0; i < 10; i++) {
          var x = (12 * (i + 1));
          var y = Math.ceil(((cache[i].value / rate) * 100)) / 100;
          if (y !== graphMaxHeight && y > 10) {
            y -= 10;
          }
          // Position based on the SVG parent relative position
          y = ((cache[i].position) === "up") ? graphMaxHeight - y : graphMaxHeight + y;
          rawPoints = rawPoints + " " + x + "," + y;
        }
        rawPoints = rawPoints + " 126,27 132,27";
  
        handler.attr('points', rawPoints);
      }
  
      function pushCache(heartBeat) {
        if (cache.length === 10) {
          cache.shift();
        }
  
        var position, length = cache.length;
  
        if (length === 0 ||
          (length !== 0 && cache[length - 1].position === "up")) {
          position = "down";
        } else {
          position = "up"
        }
  
        cache.push({
          value: heartBeat,
          position: position
        });
      }
  
      function wait() {
        var nextRefreshGap = null;
        var nextHeartBeat = null;
  
        if (iterator.hasNext()) {
          nextRefreshGap = calcRefreshGap(iterator.current()['time'], iterator.next()['time']);
          nextHeartBeat = iterator.current()['value'];
        } else {
          nextHeartBeat = randomHeartBeat();
          nextRefreshGap = randomRefreshGap();
        }
  
        setTimeout(function() {
          updateInterface(nextHeartBeat);
          wait();
        }, nextRefreshGap * 1000)
      }
  
      function getData(date) {
        // ajax request???
        var tmpData = JSON.parse('{"activities-heart":[{"customHeartRateZones":[],"dateTime":"2016-06-18","heartRateZones":[{"caloriesOut":2377.2364,"max":97,"min":30,"minutes":1366,"name":"Out of Range"},{"caloriesOut":407.6716,"max":136,"min":97,"minutes":74,"name":"Fat Burn"},{"caloriesOut":0,"max":165,"min":136,"minutes":0,"name":"Cardio"},{"caloriesOut":0,"max":220,"min":165,"minutes":0,"name":"Peak"}],"value":"75.18"}],"activities-heart-intraday":{"dataset":[{"time":"09:15:00","value":76},{"time":"09:16:00","value":95},{"time":"09:17:00","value":108},{"time":"09:18:00","value":110},{"time":"09:40:00","value":62},{"time":"09:43:00","value":59},{"time":"09:44:00","value":60},{"time":"09:45:00","value":67},{"time":"09:46:00","value":67},{"time":"09:47:00","value":66},{"time":"09:48:00","value":66},{"time":"09:49:00","value":66},{"time":"09:54:00","value":63},{"time":"09:55:00","value":66},{"time":"09:56:00","value":70},{"time":"09:57:00","value":76},{"time":"09:58:00","value":73},{"time":"09:59:00","value":76},{"time":"10:00:00","value":69},{"time":"10:01:00","value":67},{"time":"10:02:00","value":72},{"time":"10:03:00","value":70},{"time":"10:04:00","value":70},{"time":"10:05:00","value":70},{"time":"10:06:00","value":70},{"time":"10:07:00","value":72},{"time":"10:08:00","value":73},{"time":"10:09:00","value":69},{"time":"10:10:00","value":67},{"time":"10:11:00","value":87},{"time":"10:12:00","value":78},{"time":"10:13:00","value":71},{"time":"10:14:00","value":75},{"time":"10:15:00","value":86},{"time":"10:16:00","value":75},{"time":"10:17:00","value":68},{"time":"10:18:00","value":72},{"time":"10:19:00","value":69},{"time":"10:20:00","value":70},{"time":"10:21:00","value":70},{"time":"10:22:00","value":76},{"time":"10:23:00","value":77},{"time":"10:24:00","value":77},{"time":"10:25:00","value":75},{"time":"10:26:00","value":76},{"time":"10:27:00","value":73},{"time":"10:28:00","value":76},{"time":"10:29:00","value":74},{"time":"10:30:00","value":72},{"time":"10:31:00","value":71},{"time":"10:32:00","value":68},{"time":"10:33:00","value":67},{"time":"10:34:00","value":64},{"time":"10:35:00","value":63},{"time":"10:36:00","value":64},{"time":"10:37:00","value":69},{"time":"10:38:00","value":72},{"time":"10:39:00","value":69},{"time":"10:40:00","value":69},{"time":"10:41:00","value":64},{"time":"10:42:00","value":62},{"time":"10:43:00","value":64},{"time":"10:44:00","value":66},{"time":"10:45:00","value":66},{"time":"10:46:00","value":64},{"time":"10:47:00","value":77},{"time":"10:48:00","value":86},{"time":"10:49:00","value":94},{"time":"10:50:00","value":94},{"time":"10:51:00","value":70},{"time":"10:52:00","value":63},{"time":"10:54:00","value":60},{"time":"10:55:00","value":68},{"time":"10:56:00","value":69},{"time":"10:57:00","value":66},{"time":"10:58:00","value":66},{"time":"10:59:00","value":69},{"time":"11:00:00","value":73},{"time":"11:01:00","value":65},{"time":"11:02:00","value":59},{"time":"11:03:00","value":63},{"time":"11:04:00","value":64},{"time":"11:05:00","value":63},{"time":"11:06:00","value":72},{"time":"11:07:00","value":66},{"time":"11:08:00","value":65},{"time":"11:09:00","value":63},{"time":"11:10:00","value":65},{"time":"11:11:00","value":65},{"time":"11:12:00","value":63},{"time":"11:13:00","value":70},{"time":"11:14:00","value":83},{"time":"11:15:00","value":87},{"time":"11:16:00","value":88},{"time":"11:17:00","value":77},{"time":"11:18:00","value":76},{"time":"11:19:00","value":76},{"time":"11:20:00","value":76},{"time":"11:21:00","value":76},{"time":"11:22:00","value":72},{"time":"11:23:00","value":77},{"time":"11:24:00","value":75},{"time":"11:25:00","value":69},{"time":"11:26:00","value":70},{"time":"11:27:00","value":80},{"time":"11:28:00","value":69},{"time":"11:29:00","value":67},{"time":"11:30:00","value":75},{"time":"11:31:00","value":79},{"time":"11:32:00","value":72},{"time":"11:33:00","value":74},{"time":"11:34:00","value":80},{"time":"11:35:00","value":74},{"time":"11:36:00","value":74},{"time":"11:37:00","value":73},{"time":"11:38:00","value":68},{"time":"11:39:00","value":66},{"time":"11:40:00","value":67},{"time":"11:41:00","value":65},{"time":"11:42:00","value":67},{"time":"11:43:00","value":64},{"time":"11:44:00","value":66},{"time":"11:45:00","value":71},{"time":"11:46:00","value":69},{"time":"11:47:00","value":73},{"time":"11:48:00","value":70},{"time":"11:49:00","value":68},{"time":"11:50:00","value":67},{"time":"11:51:00","value":67},{"time":"11:52:00","value":70},{"time":"11:53:00","value":86},{"time":"11:54:00","value":99},{"time":"11:55:00","value":94},{"time":"11:56:00","value":104},{"time":"11:57:00","value":100},{"time":"11:58:00","value":101},{"time":"11:59:00","value":102},{"time":"12:00:00","value":97},{"time":"12:01:00","value":84},{"time":"12:02:00","value":72},{"time":"12:03:00","value":59},{"time":"12:04:00","value":59},{"time":"12:05:00","value":65},{"time":"12:06:00","value":80},{"time":"12:07:00","value":79},{"time":"12:08:00","value":79},{"time":"12:09:00","value":83},{"time":"12:10:00","value":87},{"time":"12:11:00","value":85},{"time":"12:12:00","value":83},{"time":"12:13:00","value":61},{"time":"12:14:00","value":61},{"time":"12:15:00","value":64},{"time":"12:16:00","value":67},{"time":"12:17:00","value":74},{"time":"12:18:00","value":77},{"time":"12:19:00","value":77},{"time":"12:20:00","value":79},{"time":"12:21:00","value":76},{"time":"12:22:00","value":71},{"time":"12:23:00","value":69},{"time":"12:24:00","value":69},{"time":"12:25:00","value":77},{"time":"12:26:00","value":82},{"time":"12:27:00","value":82},{"time":"12:28:00","value":81},{"time":"12:29:00","value":74},{"time":"12:30:00","value":78},{"time":"12:31:00","value":84},{"time":"12:32:00","value":87},{"time":"12:33:00","value":97},{"time":"12:34:00","value":104},{"time":"12:35:00","value":105},{"time":"12:36:00","value":105},{"time":"12:37:00","value":102},{"time":"12:38:00","value":86},{"time":"12:39:00","value":65},{"time":"12:40:00","value":69},{"time":"12:41:00","value":72},{"time":"12:42:00","value":72},{"time":"12:43:00","value":72},{"time":"12:44:00","value":70},{"time":"12:45:00","value":71},{"time":"12:46:00","value":71},{"time":"12:47:00","value":71},{"time":"12:48:00","value":68},{"time":"12:49:00","value":70},{"time":"12:50:00","value":71},{"time":"12:51:00","value":71},{"time":"12:52:00","value":71},{"time":"12:53:00","value":71},{"time":"12:54:00","value":71},{"time":"12:55:00","value":68},{"time":"12:56:00","value":74},{"time":"12:57:00","value":65},{"time":"12:58:00","value":63},{"time":"12:59:00","value":63},{"time":"13:00:00","value":63},{"time":"13:01:00","value":63},{"time":"13:27:00","value":107},{"time":"13:28:00","value":107},{"time":"13:29:00","value":105},{"time":"13:30:00","value":101},{"time":"13:31:00","value":103},{"time":"13:32:00","value":108},{"time":"13:33:00","value":110},{"time":"13:34:00","value":110},{"time":"13:35:00","value":69},{"time":"13:36:00","value":66},{"time":"13:37:00","value":67},{"time":"13:38:00","value":62},{"time":"13:39:00","value":64},{"time":"13:40:00","value":72},{"time":"13:41:00","value":79},{"time":"13:42:00","value":77},{"time":"13:43:00","value":65},{"time":"13:44:00","value":68},{"time":"13:45:00","value":61},{"time":"13:46:00","value":58},{"time":"13:47:00","value":65},{"time":"13:48:00","value":68},{"time":"13:49:00","value":66},{"time":"13:50:00","value":72},{"time":"13:51:00","value":70},{"time":"13:52:00","value":67},{"time":"13:53:00","value":65},{"time":"13:54:00","value":66},{"time":"13:55:00","value":65},{"time":"13:56:00","value":67},{"time":"13:57:00","value":68},{"time":"13:58:00","value":68},{"time":"13:59:00","value":69},{"time":"14:00:00","value":64},{"time":"14:01:00","value":68},{"time":"14:02:00","value":74},{"time":"14:03:00","value":77},{"time":"14:04:00","value":71},{"time":"14:05:00","value":70},{"time":"14:06:00","value":67},{"time":"14:07:00","value":77},{"time":"14:08:00","value":75},{"time":"14:09:00","value":68},{"time":"14:10:00","value":62},{"time":"14:11:00","value":63},{"time":"14:12:00","value":67},{"time":"14:13:00","value":68},{"time":"14:14:00","value":73},{"time":"14:15:00","value":77},{"time":"14:16:00","value":74},{"time":"14:17:00","value":72},{"time":"14:18:00","value":69},{"time":"14:19:00","value":66},{"time":"14:20:00","value":69},{"time":"14:21:00","value":67},{"time":"14:22:00","value":64},{"time":"14:23:00","value":61},{"time":"14:24:00","value":62},{"time":"14:25:00","value":78},{"time":"14:26:00","value":79},{"time":"14:27:00","value":81},{"time":"14:28:00","value":87},{"time":"14:29:00","value":94},{"time":"14:30:00","value":97},{"time":"14:31:00","value":95},{"time":"14:32:00","value":105},{"time":"14:33:00","value":105},{"time":"14:34:00","value":103},{"time":"14:35:00","value":82},{"time":"14:36:00","value":75},{"time":"14:37:00","value":71},{"time":"14:38:00","value":67},{"time":"14:39:00","value":67},{"time":"14:40:00","value":77},{"time":"14:41:00","value":70}],"datasetInterval":1,"datasetType":"minute"}}');
        return tmpData["activities-heart-intraday"]["dataset"];
      }
  
      function start() {
        data = getData(new Date());
        iterator = new Iterator(data);
  
        iterator.first();
        // 10 because there are 11 points
        for (var i = 0; i < 10; i++) {
          if (iterator.hasNext()) {
            pushCache(iterator.next()['value']);
          } else {
            pushCache(randomHeartBeat());
          }
        }
  
        if (iterator.hasNext()) {
          updateInterface(iterator.next()['value']);
        } else {
          updateInterface(randomHeartBeat());
        }
  
        wait();
      }
  
      function stop() {}
  
      return {
        start: start,
        stop: stop
      }
    };
   
  
    (function() {
      heartModule().start();
    })();
  });