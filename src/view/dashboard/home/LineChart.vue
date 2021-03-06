<template>
  <div :class="className" :style="{ height: height, width: width }" />
</template>

<script>
import echarts from "echarts";
require("echarts/theme/macarons"); // echarts theme
import resize from "./resize";

export default {
  name: "LineChart",
  mixins: [resize],
  props: {
    className: {
      type: String,
      default: "chart",
    },
    width: {
      type: String,
      default: "100%",
    },
    height: {
      type: String,
      default: "450px",
    },
    autoResize: {
      type: Boolean,
      default: true,
    },
    chartData: {
      type: Object,
      required: true,
    },
    dimension: {
      type: Array,
      default: () => [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },
    indicators: {
      type: Array,
      default: () => ["Purchase Amount", "Sales", "Expenditure", "Profit"],
    },
  },
  data() {
    return {
      chart: null,
    };
  },
  watch: {
    chartData: {
      deep: true,
      handler(val) {
        this.setOptions(val);
      },
    },
  },
  mounted() {
    this.$nextTick(() => {
      this.initChart();
    });
  },
  beforeDestroy() {
    if (!this.chart) {
      return;
    }
    this.chart.dispose();
    this.chart = null;
  },
  methods: {
    initChart() {
      this.chart = echarts.init(this.$el, "macarons");
      this.setOptions(this.chartData);
    },
    setOptions({ purchases, sales, expenses, profits } = {}) {
      this.chart.setOption({
        xAxis: {
          data: this.dimension,
          boundaryGap: false,
          axisTick: {
            show: false,
          },
        },
        grid: {
          left: 50,
          right: 50,
          bottom: 20,
          top: 30,
          containLabel: true,
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "cross",
          },
          padding: [5, 10],
        },
        yAxis: {
          axisTick: {
            show: false,
          },
        },
        legend: {
          data: this.indicators,
        },
        series: [
          {
            name: "Purchase Amount",
            smooth: true,
            type: "line",
            itemStyle: {
              normal: {
                color: "#2196F3",
                lineStyle: {
                  color: "#2196F3",
                  width: 2,
                },
              },
            },
            data: purchases,
            animationDuration: 2800,
            animationEasing: "quadraticOut",
          },
          {
            name: "Sales",
            itemStyle: {
              normal: {
                color: "#00bcd4",
                lineStyle: {
                  color: "#00bcd4",
                  width: 2,
                },
              },
            },
            smooth: true,
            type: "line",
            data: sales,
            animationDuration: 2800,
            animationEasing: "cubicInOut",
          },
          {
            name: "Expenses",
            itemStyle: {
              normal: {
                color: "#F44336",
                lineStyle: {
                  color: "#F44336",
                  width: 2,
                },
              },
            },
            smooth: true,
            type: "line",
            data: expenses,
            animationDuration: 2800,
            animationEasing: "cubicInOut",
          },
          {
            name: "Profit",
            itemStyle: {
              normal: {
                color: "#ffc107",
                lineStyle: {
                  color: "#ffc107",
                  width: 2,
                },
              },
            },
            smooth: true,
            type: "line",
            data: profits,
            animationDuration: 2800,
            animationEasing: "cubicInOut",
          },
        ],
      });
    },
  },
};
</script>
