<template>
    <div id="global">
        <div id="select">
            <div>
                <span>绘制模式：</span>
                <a-select v-model:value="mode">
                    <a-select-option v-for="m of modes" :value="m">{{
                        m
                    }}</a-select-option>
                </a-select>
            </div>
        </div>
        <canvas id="chart"></canvas>
    </div>
</template>

<script lang="ts" setup>
import axios from 'axios';
import { Chart, ChartDataset } from 'chart.js/auto';
import { onMounted, ref, watch } from 'vue';
import { getEvery, meanEvery } from '../utils';

/** 时间  平均温度 */
type Data = [string, number];

const mode = ref('年平均');
const modes = ['年平均', '月平均', '2010-2022月平均'];

let data: string;
let dataset: Data[];

let chartCanvas: HTMLCanvasElement;
let chart: Chart;
let mounted = false;

watch(mode, update);

function update() {
    if (!mounted) return;
    chart.data.datasets = [generateData()];
    chart.data.labels = generateLables();
    if (mode.value === '2010-2022月平均') {
        chart.options.elements!.point!.radius = 3;
        chart.options.elements!.point!.hoverRadius = 5;
    } else {
        chart.options.elements!.point!.radius = 0;
        chart.options.elements!.point!.hoverRadius = 0;
    }
    chart.update('active');
}

function generateLables(): string[] {
    const date = dataset.map(v => v[0]);
    if (mode.value === '年平均')
        return getEvery(date, 12).map(v => v.slice(0, 4));

    if (mode.value === '月平均')
        return date.map(v => `${v.slice(0, 4)}-${v.slice(4)}`);

    if (mode.value === '2010-2022月平均') {
        const start = date.findIndex(v => v === '201001');
        return date.slice(start).map(v => `${v.slice(0, 4)}-${v.slice(4)}`);
    }

    return [];
}

function generateData(): ChartDataset {
    const date = dataset.map(v => v[0]);
    if (mode.value === '年平均')
        return {
            data: meanEvery(
                dataset.map(v => v[1]),
                12
            )
        };

    if (mode.value === '月平均') return { data: dataset.map(v => v[1]) };

    if (mode.value === '2010-2022月平均') {
        const start = date.findIndex(v => v === '201001');
        return { data: dataset.slice(start).map(v => v[1]) };
    }
    return { data: [] };
}

onMounted(async () => {
    chartCanvas = document.getElementById('chart') as HTMLCanvasElement;
    data = (
        await axios.get(`${import.meta.env.BASE_URL}global.csv`, {
            responseType: 'text'
        })
    ).data;

    chartCanvas.width = window.innerWidth - 100;
    chartCanvas.height = window.innerHeight - 130;

    const set = data
        .split('\n')
        .slice(6)
        .map(v => v.split(','));

    dataset = set.map(v => [v[0], parseFloat(v[1])]);

    chart = new Chart(chartCanvas, {
        type: 'line',
        data: {
            datasets: [{ data: [] }],
            labels: []
        },
        options: {
            elements: {
                point: {
                    radius: 0,
                    hoverRadius: 0
                },
                line: {
                    borderJoinStyle: 'round'
                }
            },
            scales: {
                y: {
                    grid: {
                        color: '#ddd'
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

    mounted = true;

    update();
});
</script>

<style lang="less" scoped>
#global {
    width: 100%;
    height: 100%;
}

#select {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
}
</style>
