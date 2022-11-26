<template>
    <div id="multi">
        <canvas id="chart"></canvas>
        <span>当前年份：{{ now }}</span>
        <a-slider
            id="slider"
            :min="1750"
            :max="2022"
            v-model:value="now"
        ></a-slider>
    </div>
</template>

<script lang="ts" setup>
import axios from 'axios';
import { Chart, ChartData, ChartDataset } from 'chart.js/auto';
import { debounce, mean } from 'lodash';
import { onMounted, ref, watch } from 'vue';
import { has } from '../utils';

/** 时间  平均温度  平均温度不确定性  城市  国家  维度  经度 */
type Data = [string, number, number, string, string, string, string];

const now = ref(1900);
const dataset: Record<string, Data[]> = {};
let chart: Chart;
let data: string;
let chartCanvas: HTMLCanvasElement;

const update = debounce(() => {
    chart.data = generateData();
    chart.update('resize');
}, 200);

function generateData(): ChartData {
    return {
        labels: [now.value.toString()],
        datasets: Object.entries(dataset).map(v => {
            return {
                data: meanOf(v[0], now.value),
                label: v[0]
            };
        })
    };
}

function meanOf(region: string, year: number) {
    const data = dataset[region];
    if (!has(data)) return [];
    if (region.includes('undefined')) return [];

    const toMean = data.filter(v => v[0].startsWith(year.toString()));

    return [
        {
            y: data[0][5].endsWith('N')
                ? parseFloat(data[0][5])
                : -parseFloat(data[0][5]),
            x: data[0][6].trim().endsWith('W')
                ? parseFloat(data[0][6])
                : -parseFloat(data[0][6]),
            r: parseFloat(mean(toMean.map(v => v[1])).toFixed(2))
        }
    ];
}

watch(now, update);

onMounted(async () => {
    chartCanvas = document.getElementById('chart') as HTMLCanvasElement;
    data = (
        await axios.get(`${import.meta.env.BASE_URL}dataset.csv`, {
            responseType: 'text'
        })
    ).data;

    chartCanvas.width = window.innerWidth - 100;
    chartCanvas.height = window.innerHeight - 150;

    const set = data
        .split('\n')
        .slice(1)
        .map(v => v.split(','));
    // 解析数据
    set.forEach(v => {
        const [dt, tm, tmuc, city, con, lat, lon] = v;
        const id = `${city},${con}`;
        dataset[id] ??= [];
        dataset[id].push([
            dt.replaceAll('/', '-'),
            parseFloat(tm),
            parseFloat(tmuc),
            city,
            con,
            lat,
            lon
        ]);
    });
    for (const id in dataset) {
        const data = dataset[id];
        data.sort((a, b) => {
            const at = a[0];
            const bt = b[0];
            const [ay, am, ad] = at.split(/[-\/]/);
            const [by, bm, bd] = bt.split(/[-\/]/);
            return ay === by
                ? parseInt(am) - parseInt(bm)
                : parseInt(ay) - parseInt(by);
        });
    }

    chart = new Chart(chartCanvas, {
        type: 'bubble',
        data: {
            datasets: [{ data: [] }],
            labels: []
        },
        options: {
            scales: {
                y: {
                    grid: {
                        color: '#ddd'
                    },
                    min: -90,
                    max: 90,
                    ticks: {
                        stepSize: 15
                    }
                },
                x: {
                    grid: {
                        color: '#ddd'
                    },
                    min: -180,
                    max: 180,
                    ticks: {
                        stepSize: 15
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            },
            layout: {
                padding: 20
            }
        }
    });
    Chart.defaults.font.size = 20;

    update();
});
</script>

<style lang="less" scoped>
#multi {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

#slider {
    width: 90%;
}
</style>
