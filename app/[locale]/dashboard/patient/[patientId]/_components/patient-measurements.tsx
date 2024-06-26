"use client";
import "@mantine/charts/styles.css";

import { useVisits } from "@/api/visits";
import { MeasurementsTable } from "@/components/datagrids/measurements/measurements";
import type {
	ExtractedMeasurement,
	Measurement,
	Patient,
	Visit,
} from "@/lib/types";
import { AreaChart } from "@mantine/charts";
import { Box, Title } from "@mantine/core";
import { useTranslations } from "next-intl";
import { useMemo } from "react";

const colors = [
	"red",
	"teal",
	"grape",
	"gray",
	"cyan",
	"violet",
	"pink",
	"lime",
	"blue",
	"indigo",
	"orange",
	"green",
	"yellow",
];

const readings = [
	"height",
	"weight",
	"blood_pressure",
	"temperature",
	"pulse",
	"oxygen_level",
] as const;

function extractMeasurement(v: Visit) {
	if (!v.measurement || !v.start_at) return null;
	const date = new Date(v.start_at as string).getTime();

	const meas: Partial<Record<keyof Measurement, number>> & { date: string } = {
		date: new Date(date).toLocaleDateString(),
	};

	for (const reading of readings) {
		if (v.measurement[reading]) meas[reading] = Number(v.measurement[reading]);
	}

	return meas;
}

/** fill gap with previous values */
function fixMeasurements(m: ExtractedMeasurement[]) {
	for (let i = 1; i < m.length; i++) {
		m[i] = { ...m[i - 1], ...m[i] };
	}
	for (let i = m.length - 2; i >= 0; i--) {
		m[i] = { ...m[i + 1], ...m[i] };
	}
	return m;
}

export default function PatientMeasurements({ patient }: { patient: Patient }) {
	const t = useTranslations("Patient");
	const visitsQuery = useVisits({
		columnFilters: [{ id: "patient", value: patient.id }],
	});

	const data = useMemo(() => {
		if (visitsQuery.data)
			return fixMeasurements(
				visitsQuery.data.results
					.map(extractMeasurement)
					.filter(Boolean) as ExtractedMeasurement[],
			);
	}, [visitsQuery.data]);

	const measurements = useMemo(
		() =>
			visitsQuery.data?.results
				.map((vis) => {
					if (vis.start_at)
						return {
							...vis.measurement,
							date: vis.start_at,
						};
				})
				.filter(Boolean) as ExtractedMeasurement[] | undefined,
		[visitsQuery.data],
	);

	return (
		<Box>
			<Title component={"h2"} mt="xl" mb="md">
				{t("measurements")}
			</Title>
			<MeasurementsTable data={measurements} />
			<Title component={"h2"} mt="xl" mb="md">
				{t("charts")}
			</Title>
			<AreaChart
				h={300}
				data={data || []}
				dataKey="date"
				series={readings.map((name, i) => ({
					name,
					color: `${colors[i]}.6`,
				}))}
				curveType="bump"
			/>
		</Box>
	);
}
