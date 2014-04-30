$(document).ready(function(){
  var $total_cells = $('.js-total-row').find('td');

  $("input, select").on('input change',function(){
    var weekday = getInt($('#weekday option:selected').val());
    var hours = getInt($('#hours').val());
    var km = getInt($('#km').val());
    var $plan = $('#plan option:selected');
    var lg_available = $plan.data('lg-available');

    // Compute & show long distance
    if(getInt(lg_available) == 1)
    {
      ld = computeLongDistance(Math.ceil(hours / 24), km);
      $('#lg-time').text(ld.time.toFixed(2) +" $");
      $('#lg-distance').text(ld.distance.toFixed(2) +" $");
      $('#lg-total').text(ld.total.toFixed(2) +" $");
    } else {
      $('#lg-time').text('-');
      $('#lg-distance').text('-');
      $('#lg-total').text('-');
    }

    // Compute & show short distance
    sd = computeShortDistance(hours, km, weekday, $plan)
    $('#sd-time').text(sd.time.toFixed(2) +" $");
    $('#sd-distance').text(sd.distance.toFixed(2) +" $");
    $('#sd-total').text(sd.total.toFixed(2) +" $");

    highlightCheapest(ld.total, sd.total);
  })

  var now = new Date();
  var weekday = now.getDay();
  $('#weekday option[value="' + weekday + '"]').attr('selected', 'selected');
  $("form input").first().trigger('change');

  function getInt(str) {
    return parseInt(str) || 0;
  }

  function computeShortDistance(hours, km, weekday, $plan){
    var hourly_price = parseFloat($plan.data('hourly-price'));
    var hourly_extra_price = parseFloat($plan.data('hourly-extra-price'));
    var daily_price = parseFloat($plan.data('daily-price'));
    var daily_extra_price = 5;
    var km_price = parseFloat($plan.data('km-price'));
    var km_price_extra = parseFloat($plan.data('km-price-extra'));
    var km_extra_offset = 50;
    var days = 0;
    var days_max = Math.ceil(hours / 24);
    var time_cost = 0;
    var km_cost = 0;

    // Calculate time cost
    for(var hours_left = hours; hours_left > 0; hours_left = hours_left-24){
      var day_hourly_price = hourly_price;
      var day_daily_price = daily_price;

      // Extra cost from thursday to sunday
      if(weekday >= 4) {
        day_hourly_price += hourly_extra_price;
        day_daily_price += daily_extra_price;
      }

      // Apply daily cost if lower
      if(day_hourly_price * hours_left > day_daily_price) {
        time_cost += day_daily_price
      } else {
        time_cost += day_hourly_price * hours_left
      }

      weekday = (weekday < 7) ? weekday + 1 : 1
    }

    // Calculate distance cost
    km_cost = km_price * (km > km_extra_offset ? km_extra_offset : km);
    km_cost += km_price_extra * (km > km_extra_offset ? km - km_extra_offset : 0);

    return {
      time: time_cost,
      distance: km_cost,
      total: time_cost + km_cost
    };
  }

  function computeLongDistance(days, km){
    var $daily_price = $('#lg-daily-price option:selected');
    var daily_price = parseFloat($daily_price.attr('value'));
    var daily_first_extra = parseFloat($daily_price.data('first-extra'));
    var weekly_price = parseFloat($daily_price.data('weekly-price'));
    var base_km_price = 0.17;
    var extra_km_price = 0.13;
    var extra_offset = 300;

    // Calculate time cost
    var time_cost = 0;
    for(var days_left = days; days_left > 0; days_left = days_left-1){
      // Apply weekly cost if possible
      if(days_left >= 6) {
        time_cost += weekly_price;
        days_left = days_left - 6;
      } else {
        // First day extra
        if(days_left == days) time_cost += daily_first_extra;
        time_cost += daily_price;
      }
    }

    // Calculate distance cost
    var km_cost = base_km_price * (km > extra_offset ? extra_offset : km);
    km_cost += extra_km_price * (km > extra_offset ? km - extra_offset : 0);

    return {
      time: time_cost,
      distance: km_cost,
      total: time_cost + km_cost
    };
  }

  function highlightCheapest(longDistance, shortDistance) {
    var cheapest = (longDistance && longDistance < shortDistance) ? 'lg' : 'sd';

    $total_cells.removeClass('highlight');
    $total_cells.filter('#' + cheapest + '-total').addClass('highlight');
  }
});
