<script lang="ts">
	import type { ApexOptions } from 'apexcharts';
	import {
		Chart,
		Card,
		A,
		Button,
		Dropdown,
		DropdownItem,
		Popover,
		Tooltip
	} from 'flowbite-svelte';
	import {
		InfoCircleSolid,
		ArrowDownToBracketOutline,
		ChevronDownOutline,
		ChevronRightOutline,
		PenSolid,
		DownloadSolid,
		ShareNodesSolid
	} from 'flowbite-svelte-icons';

	// export let id = 'DonutChart';
	export let title = 'Credits';
	export let description = 'Credits of this category completed...';
	export let series = [50, 50];
	export let labels = ['Credits Completed', 'Credits Remaining'];

	const options: ApexOptions = {
		series: series,
		colors: ['#272861', '#D6D6D6'],
		chart: {
			height: 320,
			width: '100%',
			type: 'donut'
		},
		stroke: {
			colors: ['transparent'],
			lineCap: 'square'
		},
		plotOptions: {
			pie: {
				donut: {
					labels: {
						show: true,
						name: {
							show: true,
							fontFamily: 'Inter, sans-serif',
							offsetY: 20
						},
						total: {
							showAlways: true,
							show: true,
							label: 'Unique visitors',
							fontFamily: 'Inter, sans-serif',
							formatter: function (w: any) {
								const sum = w.globals.seriesTotals.reduce((a: number, b: number) => {
									return a + b;
								}, 0);
								return `${sum}k`;
							}
						},
						value: {
							show: true,
							fontFamily: 'Inter, sans-serif',
							offsetY: -20,
							formatter: function (value: string) {
								return value + 'k';
							}
						}
					},
					size: '80%'
				}
			}
		},
		grid: {
			padding: {
				top: -2
			}
		},
		labels: labels,
		dataLabels: {
			enabled: false
		},
		legend: {
			position: 'bottom',
			fontFamily: 'Inter, sans-serif'
		},
		yaxis: {
			labels: {
				formatter: function (value: number) {
					return value + 'k';
				}
			}
		},
		xaxis: {
			labels: {
				formatter: function (value: string) {
					return value + 'k';
				}
			},
			axisTicks: {
				show: false
			},
			axisBorder: {
				show: false
			}
		}
	};
</script>

<div>
	<div class="flex w-full items-start justify-between">
		<div class="flex-col items-center">
			<div class="mb-1 flex items-center">
				<h5 class="me-1 text-xl font-bold leading-none text-gray-900">{title}</h5>
				<InfoCircleSolid
					id="donut1"
					class="ms-1 h-3.5 w-3.5  cursor-pointer  text-gray-500 hover:text-gray-900"
				/>
				<Popover
					triggeredBy="#donut1"
					class="z-10 w-72 rounded-lg border border-gray-200 bg-white text-sm text-gray-500 shadow-sm"
					placement="bottom-start"
				>
					<div class="space-y-2 p-3">
						{description}
						<A href="/">Read more <ChevronRightOutline class="ms-1.5 h-2 w-2" /></A>
					</div>
				</Popover>
			</div>
		</div>
		<div class="flex items-center justify-end">
			<ArrowDownToBracketOutline class="h-3.5 w-3.5" />
			<Tooltip>Download CSV</Tooltip>
		</div>
	</div>

	<Chart {options} class="py-6" />
</div>
