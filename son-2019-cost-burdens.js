var H = Highcharts
var cbsas = Highcharts.geojson(Highcharts.maps['countries/us/cbsa'])
var states = Highcharts.geojson(Highcharts.maps['countries/us/states'])

var sheetID = '1FroaeijtlKq2Gmgoy0exkk67AeYixT9qdgzhX7KsN4c'
var range = 'Sheet8!A:CO'

var chart_title = 'Many Households Burdened by Housing Costs in 2017'
var chart_subtitle = 'Select a household type:'
var legend_title = 'Share of Households <br/>with Cost Burdens<br/>(Percent)'

var table_notes = 'Notes: Cost-burdened (severely cost-burdened) households pay more than 30% (more than 50%) of income for housing. Households with zero or negative income are assumed to have severe burdens, while households paying no cash rent are assumed to be without burdens. Monthly housing costs include the contract rent and utilities for renter households. For homeowners, monthly housing costs include any mortgage payments, property taxes, insurance, utilities, and condominium or mobile home fees.<br/> Source: JCHS tabulations of US Census Bureau, 2006–2017 American Community Survey 1-Year Estimates using the Missouri Data Center MABLE/geocorr14.'

//To enable drilldown change on radio button change, need to create variables for GEOID and metro_name
var selected_metro_name = ""
var selected_GEOID = ""

var export_filename = "Housing Cost Burdens - Harvard JCHS - State of the Nation's Housing 2019"

var default_selection = 2

var categories = [],
    ref_data = [],
    selected_data = [],
    chart_options = {},
    chart = {},
    drilldown_chart = {}

/*~~~~~~~ Document ready function ~~~~~~~*/
$(document).ready(function() {
  //get Google sheet data
  $.get(H.JCHS.requestURL(sheetID, range), function(obj) {
    categories = obj.values[0]
    ref_data = obj.values.slice(1)

    //create the title, notes, and search box
    $('#chart_title').html(chart_title)
    $('#chart_subtitle').html(chart_subtitle)
    $('#table_notes').html(table_notes)

    H.JCHS.createSearchBox(ref_data, searchCallback, '', 1, 'search', 'Need help finding a metro? Search here...') //4th argument (the 1) tells the search box to list column index 1 from ref_data, instead of the default 0 (in this case metro name, not GEOID)

    //create the chart
    createChart()

  })
}) //end document.ready


function createChart() {

  selected_data = ref_data.map(function (x) {
    return [x[0], x[default_selection]] //return data in 2 columns, GEOID and the value to be mapped

  })

  /*~~~~~~~ Chart Options ~~~~~~~*/
  chart_options = {
    JCHS: {
      drilldownFunction: drilldownChart
    },
    chart: {
      events: {
        load: function() {
          initUserInteraction()
        },
      },
    },

    legend: {
        title: {
          text: legend_title
        },
    },
    colorAxis: {
      dataClasses: [
        { from: 0, to : 10 },
        { from: 10, to: 20 },
        { from: 20, to: 30 },
        { from: 30, to: 40 },
        { from: 40, to: 50 },
        { from: 50 }
      ]
    },
    series: [
      {
        type: 'map',
        name: categories[default_selection],
        mapData: cbsas,
        data: selected_data
      }, {
        type: 'mapline',
        name: 'State borders',
        data: states
      }
    ], //end series


    // Exporting options
    exporting: {
      filename: export_filename,
      JCHS: { sheetID: sheetID },
      chartOptions: {
        title: { text: chart_title },
      }
    }, //end exporting

    tooltip: {
      formatter: function() {
        var point = this.point
        var series = this.series
        var user_selection = $('#user_input :checked').val()

        var tooltip_text = ''
        tooltip_text +=  '<b>' +  point.name + '</b>'

        ref_data.forEach(function (row) {
          if (row[0] == point.GEOID) {
            switch (user_selection) {
              case '2':
                tooltip_text += '<br><i>Share of Households with Cost Burdens: </i><b>' + H.JCHS.numFormat(point.value, 1) + '%</b>'
                tooltip_text += '<br><br>Share of Households with Severe Cost Burdens: <b>' + H.JCHS.numFormat(row[5], 1) + '%</b>'
                tooltip_text += '<br>Households with Cost Burdens: <b>' + H.JCHS.numFormat(row[8]) + '</b>'
                tooltip_text += '<br>Median Household Income: <b>$' + H.JCHS.numFormat(row[11]) + '</b>'
                tooltip_text += '<br>Median Monthly Housing Costs: <b>$' + H.JCHS.numFormat(row[14]) + '</b>'
                break
              case '3':
                tooltip_text += '<br><i>Share of Renter Households with Cost Burdens: </i><b>' + H.JCHS.numFormat(point.value, 1) + '%</b>'
                tooltip_text += '<br><br>Share of Renter Households with Severe Cost Burdens: <b>' + H.JCHS.numFormat(row[6], 1) + '%</b>'
                tooltip_text += '<br>Renter Households with Cost Burdens: <b>' + H.JCHS.numFormat(row[9]) + '</b>'
                tooltip_text += '<br>Median Renter Household Income: <b>$' + H.JCHS.numFormat(row[12]) + '</b>'
                tooltip_text += '<br>Median Renter Monthly Housing Costs: <b>$' + H.JCHS.numFormat(row[15]) + '</b>'
                break
              case '4':
                tooltip_text += '<br><i>Share of Homeowner Households with Cost Burdens: </i><b>' + H.JCHS.numFormat(point.value, 1) + '%</b>'
                tooltip_text += '<br><br>Share of Homeowner Households with Severe Cost Burdens: <b>' + H.JCHS.numFormat(row[7], 1) + '%</b>'
                tooltip_text += '<br>Homeowner Households with Cost Burdens: <b>' + H.JCHS.numFormat(row[10]) + '</b>'
                tooltip_text += '<br>Median Homeowner Household Income: <b>$' + H.JCHS.numFormat(row[13]) + '</b>'
                tooltip_text += '<br>Median Homeowner Monthly Housing Costs: <b>$' + H.JCHS.numFormat(row[16]) + '</b>'
                break
              case '5':
                tooltip_text += '<br><i>Share of Households with Severe Cost Burdens: </i><b>' + H.JCHS.numFormat(point.value, 1) + '%</b>'
                tooltip_text += '<br><br>Share of Households with Cost Burdens: <b>' + H.JCHS.numFormat(row[2], 1) + '%</b>'
                tooltip_text += '<br>Households with Cost Burdens: <b>' + H.JCHS.numFormat(row[8]) + '</b>'
                tooltip_text += '<br>Median Household Income: <b>$' + H.JCHS.numFormat(row[11]) + '</b>'
                tooltip_text += '<br>Median Monthly Housing Costs: <b>$' + H.JCHS.numFormat(row[14]) + '</b>'
                break
              case '6':
                tooltip_text += '<br><i>Share of Renter Households with Severe Cost Burdens: </i><b>' + H.JCHS.numFormat(point.value, 1) + '%</b>'
                tooltip_text += '<br><br>Share of Renter Households with Cost Burdens: <b>' + H.JCHS.numFormat(row[3], 1) + '%</b>'
                tooltip_text += '<br>Renter Households with Cost Burdens: <b>' + H.JCHS.numFormat(row[9]) + '</b>'
                tooltip_text += '<br>Median Renter Household Income: <b>$' + H.JCHS.numFormat(row[12]) + '</b>'
                tooltip_text += '<br>Median Renter Monthly Housing Costs: <b>$' + H.JCHS.numFormat(row[15]) + '</b>'
                break
              case '7':
                tooltip_text += '<br><i>Share of Homeowner Households with Severe Cost Burdens: </i><b>' + H.JCHS.numFormat(point.value, 1) + '%</b>'
                tooltip_text += '<br><br>Share of Homeowner Households with Cost Burdens: <b>' + H.JCHS.numFormat(row[4], 1) + '%</b>'
                tooltip_text += '<br>Homeowner Households with Cost Burdens: <b>' + H.JCHS.numFormat(row[10]) + '</b>'
                tooltip_text += '<br>Median Homeowner Household Income: <b>$' + H.JCHS.numFormat(row[13]) + '</b>'
                tooltip_text += '<br>Median Homeowner Monthly Housing Costs: <b>$' + H.JCHS.numFormat(row[16]) + '</b>'
                break
            }
          }
        })

        tooltip_text += '<br><br><i>Click to see change over time...</i>'

        return tooltip_text

      }
    }
  } //end chart_options

  /*~~~~~~~ Create Chart ~~~~~~~*/
  chart = Highcharts.mapChart(
    'container',
    chart_options
  ) //end chart

} //end createChart()

/*~~~~~~~~~~~~~~ User interaction ~~~~~~~~~~~~~~~~~~~*/
function initUserInteraction () {
  $('#user_input').on('change', function () {
    var new_col = parseInt($('#user_input :checked').val())
    var new_data = ref_data.map(function (x) {
      return [x[0], x[new_col]]
    })
    chart.series[0].update({name: categories[new_col]})
    chart.series[0].setData(new_data)
    /*The following code changes the drilldown when the radio buttons change, by calling
    the drilldownChart function (defined below) -- only when a metro has been selected --
    and passing as arguments the selected metro name and GEOID, which are created as variables
    containing empty strings at the top of the code, and assigned in the drilldownChart function.*/
    if(selected_metro_name!="") {
      drilldownChart(selected_metro_name, selected_GEOID)
    }
  })
}

function drilldownChart(metro_name, GEOID) {
  /*To hide the drilldown when the map loads but then show it when a metro is clicked,
  I set the CSS to display = "none" and then call the drilldown div here and set display
  to "block". -RF, 5/30/19*/
  var showDrilldown = document.getElementById("drilldown_chart")
  showDrilldown.style.display = "block";

  /*To enable the drilldownChart function embedded in the initUserInteraction function
  to work, I need to assign the variables selected_metro_name and selected_GEOID here,
  so that when initUserInteraction fires, drilldownChart will fire*/
  selected_metro_name = metro_name
  selected_GEOID = GEOID

  var selected_hhd_type = $('#user_input :checked').parent('label').text().trim()

  var burden_type = '' //Creating a simple variable to add 'severe' to the drilldown title before 'cost burdens' if one of the severe options is selected; otherwise, no text added
    if($('#user_input :checked').val() > 4) {burden_type = 'Severe '}

  var chart_data = []

  ref_data.forEach(function (el) {
    if (el[0] == GEOID) {
      switch ($('#user_input :checked').val()) {
        case '2':
          chart_data = el.slice(18,29) //2006: 17, 2017: 28
          break
        case '3':
          chart_data = el.slice(30,41)
          break
        case '4':
          chart_data = el.slice(42,53)
          break
        case '5':
          chart_data = el.slice(55,66)
          break
        case '6':
          chart_data = el.slice(68,79)
          break
        case '7':
          chart_data = el.slice(81,92)
          break
      } //end switch
    } //end if
  }) //end forEach

  var drilldown_options = {
    JCHS: {
      yAxis_title: 'Percent'
    },

    subtitle: {
      text:
      'Share of ' + selected_hhd_type + ' with ' + burden_type + 'Cost Burdens in ' + metro_name
    },


    yAxis: [{
      labels: {
        enabled: true,
        format: "{value}%"
      }
    }],

    xAxis: {
      categories: categories.slice(18, 29)
    },

    tooltip: {
      pointFormat: "<b>{point.y}</b>",
      valueDecimals: 0,
      valueSuffix: '%'
    },

    series: [
      {
        name: metro_name,
        data: chart_data,
        zones: [
          {
            value: 10,
            className: 'zone-0'
          },
          {
            value: 20,
            className: 'zone-1'
          },
          {
            value: 30,
            className: 'zone-2'
          },
          {
            value: 40,
            className: 'zone-3'
          },
          {
            value: 50,
            className: 'zone-4'
          },
          {
            className: 'zone-5'
          }
        ],
    }],
  }

  drilldown_chart = Highcharts.chart(
    'drilldown_chart',
    H.merge(H.JCHS.drilldownOptions, drilldown_options)
  )
} //end drilldownChart()

function searchCallback (metro_name) {
  H.JCHS.mapLocatorCircle(chart, metro_name)
}
