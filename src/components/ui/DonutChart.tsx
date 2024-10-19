import { Pie, PieChart, Label } from "recharts";

type DonutChartProps = {
  score: number;
};

const DonutChart = ({ score }: DonutChartProps) => {
  const chartData = [
    { name: "ATS Score", value: score, fill: "var(--primary)" },
    { name: "Remaining", value: 100 - score, fill: "var(--secondary)" },
  ];

  return (
    <PieChart width={180} height={180}>
      <Pie
        data={chartData}
        dataKey="value"
        innerRadius={60}
        outerRadius={80}
        startAngle={90}
        endAngle={450}
        stroke="none"
      >
        <Label
          value={`${score}%`}
          position="center"
          className="text-3xl font-bold text-primary"
        />
      </Pie>
    </PieChart>
  );
};

export default DonutChart;
