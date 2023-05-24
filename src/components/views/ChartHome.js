import { createChart } from "lightweight-charts";
import React, { useEffect, useRef } from "react";

const ChartHome = (chartData) => {
  const chartRef = useRef();
  const switchRef = useRef();

  var chart;
  var areaSeries = null;

  function syncToInterval() {
    if (areaSeries) {
      chart.removeSeries(areaSeries);
      areaSeries = null;
    }
    areaSeries = chart.addAreaSeries({
      topColor: "#4caf4f66",
      bottomColor: "rgba(97, 255, 102, 0.04)",
      lineColor: "rgba(76, 175, 80, 1)",
      lineWidth: 2,
    });
    areaSeries.setData(chartData.chartData);
  }

  const loadChart = () => {
    if (chartRef.current.children[0]) {
      chartRef.current.removeChild(chartRef.current.children[0]);
    }

    chart = createChart(chartRef.current, {
      // width: 500,
      height: 400,
      layout: {
        backgroundColor: "#000000",
        textColor: "#d1d4dc",
      },
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          color: "rgba(42, 46, 57, 0.5)",
        },
      },
      rightPriceScale: {
        borderVisible: false,
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderVisible: false,
      },
      crosshair: {
        horzLine: {
          visible: false,
        },
      },
    });
    syncToInterval();
  };

  const filterChart = (timeIntervel) => {
    // const timeNow = Math.floor(Date.now() / 1000 - timeIntervel);
    var previousTime = chartData.chartData[0]?.time;
    const filteredData = chartData.chartData.filter((data) => {
      if (data?.time >= previousTime + timeIntervel) {
        previousTime = data?.time;
        return data?.time;
      }
    });
    if (areaSeries) {
      chart.removeSeries(areaSeries);
      areaSeries = null;
    }
    areaSeries = chart.addAreaSeries({
      topColor: "rgba(76, 175, 80, 0.56)",
      bottomColor: "rgba(76, 175, 80, 0.04)",
      lineColor: "rgba(76, 175, 80, 1)",
      lineWidth: 2,
    });
    if (timeIntervel === 0) {
      areaSeries.setData(chartData.chartData);
    } else {
      areaSeries.setData(filteredData);
    }
  };

  useEffect(() => {
    if (chartData.chartData && chartData.chartData.length !== 0)
      loadChart();
  }, [chartData.chartData]);

  return (
    <div>
      <div ref={chartRef} className="w-full" />
      <div ref={switchRef} />
      <div className="flex items-center flex-wrap gap-1 mt-2">
        <button
          onClick={() => filterChart(0)}
          className="border border-green-600 rounded-md px-2 hover:bg-green-600 hover:text-white dark:text-grey-dark active:bg-green-900 mr-2"
        >
          No Filter
        </button>
        <button
          onClick={() => filterChart(900)}
          // onClick={() => filterChart(1)}
          className="border border-green-600 rounded-md px-2 hover:bg-green-600 hover:text-white dark:text-grey-dark active:bg-green-900 mr-2"
        >
          15Min
        </button>
        <button
          onClick={() => filterChart(3600)}
          // onClick={() => filterChart(4)}
          className="border border-green-600 rounded-md px-2 hover:bg-green-600 hover:text-white dark:text-grey-dark active:bg-green-900 mr-2"
        >
          1H
        </button>
        <button
          onClick={() => filterChart(14400)}
          // onClick={() => filterChart(8)}
          className="border border-green-600 rounded-md px-2 hover:bg-green-600 hover:text-white dark:text-grey-dark active:bg-green-900 mr-2"
        >
          4H
        </button>
        <button
          onClick={() => filterChart(86400)}
          // onClick={() => filterChart(16)}
          className="border border-green-600 rounded-md px-2 hover:bg-green-600 hover:text-white dark:text-grey-dark active:bg-green-900 mr-2"
        >
          1D
        </button>
        <button
          onClick={() => filterChart(604800)}
          // onClick={() => filterChart(20)}
          className="border border-green-600 rounded-md px-2 hover:bg-green-600 hover:text-white dark:text-grey-dark active:bg-green-900 mr-2"
        >
          1W
        </button>
        {/* <button
                onClick={() => filterChart(2628000)}
                // onClick={() => filterChart(24)}
                className="border border-green-600 rounded-md px-2 hover:bg-green-600 hover:text-white dark:text-grey-dark active:bg-green-900 mr-2"
              >
                1M
              </button> */}
        {/* <button
                onClick={() => filterChart(7884000)}
                className="border border-green-600 rounded-md px-2 hover:bg-green-600 hover:text-white dark:text-grey-dark active:bg-green-900 mr-2"
              >
                3M
              </button>
              <button
                onClick={() => filterChart(15770000)}
                className="border border-green-600 rounded-md px-2 hover:bg-green-600 hover:text-white dark:text-grey-dark active:bg-green-900 mr-2"
              >
                6M
              </button> */}
      </div>
    </div>
  )

};

// function App(props) {
//   return <ChartComponent {...props} data={initialData} />;
// }

export default ChartHome;
