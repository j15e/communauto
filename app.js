$(document).ready(function(){
  $("form input,select").on('change',function(){
    var weekday = getInt($('#weekday option:selected').val());
    var hours = getInt($('#hours').val());
    var km = getInt($('#km').val());
    var $plan = $('#plan option:selected');

    // Compute & show long distance
    ld = computeLongDistance(Math.ceil(hours / 24), km);
    $('#lg-time').text(ld.time.toFixed(2) +" $");
    $('#lg-distance').text(ld.distance.toFixed(2) +" $");
    $('#lg-total').text(ld.total.toFixed(2) +" $");

    // Compute & show short distance
    sd = computeShortDistance(hours, km, weekday, $plan)
    $('#sd-time').text(sd.time.toFixed(2) +" $");
    $('#sd-distance').text(sd.distance.toFixed(2) +" $");
    $('#sd-total').text(sd.total.toFixed(2) +" $");
  })

  var now = new Date();
  var weekday = now.getDay();
  $('#weekday option[value="' + weekday + '"]').attr('selected', 'selected');
  $("form input").trigger('change');

  function getInt(str) {
    return parseInt(str) || 0;
  }

  function computeShortDistance(hours, km, weekday, $plan){
    var hourly_price = parseFloat($plan.data('hourly-price'));
    var hourly_extra_price = parseFloat($plan.data('hourly-extra-price'));
    var daily_price = parseFloat($plan.data('daily-price'));
    var daily_extra_price = 5;
    var km_price = parseFloat($plan.data('km-price'));
    var days = 0;

    // Extra cost for weekend
    if(weekday >= 4) {
      hourly_price += hourly_extra_price;
      daily_price += daily_extra_price;
    }

    // Daily cost
    if(hours > 24) {
      days = hours - (hours % 24) / 24;
      hours = hours % 24;
    }

    time_cost = (daily_price * days) + (hourly_price * hours);
    km_cost = km_price * km;

    return {
      time: time_cost,
      distance: km_cost,
      total: time_cost + km_cost
    };
  }

  function computeLongDistance(days, km){
    var daily_price = 24.99;
    var base_km_price = 0.16;
    var extra_km_price = 0.13;
    var extra_offset = 300;

    // @todo compute week cost
    days_cost = days * daily_price;
    km_cost = base_km_price * (km > extra_offset ? extra_offset : km);
    km_cost += base_km_price * (km > extra_offset ? km - extra_offset : 0);

    return {
      time: days_cost,
      distance: km_cost,
      total: days_cost + km_cost
    };
  }
});