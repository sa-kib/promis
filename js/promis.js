/* copyright © 2016 PROMIS & ISR UA */

var PROMIS = {};

(function() {
  var map = null;
  var orbit = null;

  PROMIS.toggleParam = function(obj) {
    var i = $(obj).parent().parent().parent();

    if(obj.checked) {
      $(i).css('color', 'black');
    } else {
      $(i).css('color', 'gray');
    }
  }

  function displaySession(number) {
    $.getJSON('data/session' + number + '.json', function(json) {
      var dgeo = json.geometry.coordinates;
      var poln = [];

      PROMIS.orbit = [];

      $.each(dgeo[0].concat(dgeo[1]), function(i, item) {
        poln.push({lat: item[1], lng: item[0]});
        PROMIS.orbit.push({lat: item[1], lng: item[0]});
      });

      // clean previous orbit
      if (orbit) {
        orbit.setMap(null);
      }

      orbit = new google.maps.Polyline({
        path: poln,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
      });

      orbit.setMap(map);
      //https://developers.google.com/maps/documentation/javascript/examples/polyline-simple
    });
  }

  PROMIS.setupMap = function() {
    var mapCanvas = document.getElementById("map");
    var mapOptions = {
      center: new google.maps.LatLng(51.5, 1), zoom: 1
    };
    
    map = new google.maps.Map(mapCanvas, mapOptions);

    google.maps.event.addListenerOnce(map, 'idle', function(){
      PROMIS.bounds = this.getBounds();
    });
    google.maps.event.addListener(map, 'bounds_changed', function() {
      PROMIS.bounds = this.getBounds();
    });

    displaySession(2);
  }

  PROMIS.showOnTheMap = function() {
    var bounds = new google.maps.LatLngBounds();

    bounds.extend(new google.maps.LatLng($('#geolat1').val(), $('#geolon1').val()));
    bounds.extend(new google.maps.LatLng($('#geolat2').val(), $('#geolon2').val()));

    google.maps.event.trigger(map, 'resize');
    map.fitBounds(bounds);
  }

  /* main func */
  $(document).ready(function(){


    $('.emptynotice').hide();

    $('input[name="daterange"]').daterangepicker({
      locale: {
        format: 'YYYY-MM-DD'
      },
      startDate: '2011-08-01',
      endDate: '2011-10-31'
    });

    $('[data-toggle="tooltip"]').tooltip();

    $('.showonthemap').click(function(){
      $('.mapblock').css('visibility','visible');
      PROMIS.showOnTheMap();
    });

    $('#sel1').change(function(){
      if($('#sel1 option:selected').val() != 'a') {
        $('.emptynotice').show();
        $('.searchbutton').prop('disabled', 'disabled');
        $('.checkparam').hide();
      } else {
        $('.checkparam').show();
        $('.emptynotice').hide();
        $('.searchbutton').removeProp('disabled');
      }
    });

    $(document).on('change', '.checkparam input[type="checkbox"]', function(e) {
      PROMIS.toggleParam(e.target);
    });

    $('.checkparam input[type="checkbox"]').each(function(i, e){
      PROMIS.toggleParam(e);
    });
  });

})();