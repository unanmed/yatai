<template>
    <div id="one">
        <div id="select">
            <span
                >数据模式：
                <select v-model="nowType">
                    <option v-for="t of dataType" :value="t">{{ t }}</option>
                </select>
            </span>
            <span
                >国家：
                <select v-model="contry">
                    <option v-for="con of contries" :value="con">
                        {{ con }}
                    </option>
                </select></span
            >
            <span
                >城市：
                <select v-model="region">
                    <option v-for="city of allRegion" :value="city">
                        {{ city }}
                    </option>
                </select></span
            >
            <span
                >经纬度：{{ latitude }}&nbsp;&nbsp;&nbsp;&nbsp;{{
                    longitude
                }}</span
            >
        </div>
        <div id="chart-div">
            <canvas id="chart"></canvas>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref, watch } from 'vue';
import axios from 'axios';
import { Chart, ChartDataset } from 'chart.js/auto';
import { getEvery, maxEvery, meanEvery, minEvery } from '../utils';

/** 时间  平均温度  平均温度不确定性  城市  国家  维度  经度 */
type Data = [string, number, number, string, string, string, string];
type Region = `${string},${string}`;

const region = ref('');
const contry = ref('');
const nowType = ref('年平均');
const dataType = [
    '年平均',
    '月平均',
    '五年平均',
    '十年平均',
    '年最高',
    '年最低',
    '年最高|年最低|年平均'
];
let data: string;
let regions: Record<string, string[]> = {};
let regiondata: Record<Region, Data[]> = {};
let contries: string[] = [];

let chartCanvas: HTMLCanvasElement;
let chart: Chart;
let mounted = false;

const allRegion = computed(() => {
    return regions[contry.value];
});

const nowData = computed(() => {
    const con = contry.value;
    const reg = region.value;
    if (!mounted) return [];
    if (!regions[con].includes(region.value)) {
        region.value = regions[con][0];
    }
    return regiondata[`${region.value},${con}`];
});

const latitude = computed(() => {
    const con = contry.value;
    const reg = region.value;
    if (!mounted) return '';
    return regiondata[`${reg},${con}`][0][5];
});

const longitude = computed(() => {
    const con = contry.value;
    const reg = region.value;
    if (!mounted) return '';
    return regiondata[`${reg},${con}`][0][6];
});

watch(nowData, update);

watch(nowType, update);

function update() {
    if (!mounted) return;
    if (nowType.value === '年最高|年最低|年平均') {
        chart.data.datasets = [
            generateData(nowData.value, '年最低'),
            generateData(nowData.value, '年最高'),
            generateData(nowData.value, '年平均')
        ];
    } else {
        chart.data.datasets = [generateData(nowData.value)];
    }
    chart.data.labels = generateLables(nowData.value);
    chart.update('active');
}

function generateLables(data: Data[]): string[] {
    const date = data.map(v => v[0]);
    if (
        nowType.value === '年平均' ||
        nowType.value === '年最高' ||
        nowType.value === '年最低' ||
        nowType.value === '年最高|年最低|年平均'
    )
        return getEvery(date, 12).map(v => v.slice(0, 4));

    if (nowType.value === '月平均') return date;

    if (nowType.value === '五年平均')
        return getEvery(date, 60).map(v => v.slice(0, 4));

    if (nowType.value === '十年平均')
        return getEvery(date, 120).map(v => v.slice(0, 4));
    return [];
}

function generateData(data: Data[], type = nowType.value): ChartDataset {
    if (type === '年平均')
        return {
            data: meanEvery(
                data.map(v => v[1]),
                12
            )
        };

    if (type === '月平均') return { data: data.map(v => v[1]) };

    if (type === '五年平均')
        return {
            data: meanEvery(
                data.map(v => v[1]),
                60
            )
        };

    if (type === '十年平均')
        return {
            data: meanEvery(
                data.map(v => v[1]),
                120
            )
        };

    if (type === '年最高')
        return {
            data: maxEvery(
                data.map(v => v[1]),
                12
            )
        };

    if (type === '年最低')
        return {
            data: minEvery(
                data.map(v => v[1]),
                12
            )
        };
    return { data: [] };
}

onMounted(async () => {
    chartCanvas = document.getElementById('chart') as HTMLCanvasElement;
    data = (
        await axios.get(`${import.meta.env.BASE_URL}dataset.csv`, {
            responseType: 'text'
        })
    ).data;

    chartCanvas.width = window.innerWidth - 100;
    chartCanvas.height = window.innerHeight - 100;

    const set = data
        .split('\n')
        .slice(1)
        .map(v => v.split(','));
    // 解析数据
    set.forEach(v => {
        const [dt, tm, tmuc, city, con, lat, lon] = v;
        regions[con] ??= [];
        if (!contries.includes(con)) contries.push(con);
        if (!regions[con].includes(city)) regions[con].push(city);
        const id = `${city},${con}` as Region;
        regiondata[id] ??= [];
        regiondata[id].push([
            dt.replaceAll('/', '-'),
            parseFloat(tm),
            parseFloat(tmuc),
            city,
            con,
            lat,
            lon
        ]);
    });
    for (const id in regiondata) {
        const data = regiondata[id as Region];
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

    region.value = 'Kabul';
    contry.value = 'Afghanistan';

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
});
</script>

<style lang="less" scoped>
#one {
    color: black;
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
