import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TimingMetric {
  name: string;
  value: number;
  percentage: number;
}

interface DocumentMetrics {
  size_kb: number;
  total_chunks: number;
  selected_chunks: number;
  chunk_size: number;
  context_length: number;
}

interface ProcessingTime {
  timestamp: string;
  llm_time: number;
  doc_time: number;
}

interface ChartData {
  logs: any[];
  documentMetrics: DocumentMetrics[];
  processingTimes: ProcessingTime[];
  latestTimings: {
    llm: TimingMetric[];
    doc: TimingMetric[];
  };
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

interface PerformanceMetricsProps {
  metricsData: {
    data: ChartData | null;
    error: string | null;
    isLoading: boolean;
    hasMetrics: boolean;
  };
}

export default function PerformanceMetrics({
  metricsData,
}: PerformanceMetricsProps) {
  const [activeTab, setActiveTab] = useState("timing");
  const { data, error, isLoading } = metricsData;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-muted-foreground">Loading metrics...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-destructive">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px]">
            <p className="text-muted-foreground">
              No performance data available
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestLog = data.logs[data.logs.length - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Metrics</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="timing">Processing Times</TabsTrigger>
            <TabsTrigger value="document">Document Metrics</TabsTrigger>
            <TabsTrigger value="history">Historical Data</TabsTrigger>
          </TabsList>

          <TabsContent value="timing" className="space-y-4">
            <div className="text-sm text-muted-foreground mb-4">
              <p>
                Performance breakdown of the last query. Hover over chart
                segments for detailed timing information.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* LLM Processing Time Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>LLM Processing</span>
                    <span className="text-base font-normal">
                      {(latestLog.total_llm_time || 0).toFixed(1)}s total
                    </span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Time spent on retrieving context and generating answers
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.latestTimings.llm.filter(
                            (entry) => entry.value > 0
                          )}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          label={({ name, percent }) =>
                            `${name.split(" ")[0]}\n${(percent * 100).toFixed(
                              0
                            )}%`
                          }
                          labelLine={{
                            stroke: "hsl(var(--muted-foreground))",
                            strokeWidth: 1,
                          }}
                        >
                          {data.latestTimings.llm.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              strokeWidth={1}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number, name: string) => {
                            const percent = (
                              (value / latestLog.total_llm_time) *
                              100
                            ).toFixed(1);
                            const descriptions: { [key: string]: string } = {
                              "Document Retrieval":
                                "Time spent finding relevant document sections",
                              "Content Chunking":
                                "Time spent splitting document into processable pieces",
                              "Relevance Analysis":
                                "Time spent determining most relevant content",
                              "Prompt Creation":
                                "Time spent preparing prompts for the LLM",
                              "LLM Processing":
                                "Time spent generating the answer",
                              "Cache Update": "Time spent updating the cache",
                            };
                            return [
                              `${value.toFixed(2)}s (${percent}%)\n${
                                descriptions[name] || ""
                              }`,
                              name,
                            ];
                          }}
                          wrapperStyle={{ fontSize: "12px" }}
                        />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{
                            fontSize: "12px",
                            paddingTop: "20px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Document Processing Time Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>Document Processing</span>
                    <span className="text-base font-normal">
                      {(latestLog.total_doc_time || 0).toFixed(1)}s total
                    </span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Time spent on document loading and processing operations
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.latestTimings.doc.filter(
                            (entry) => entry.value > 0
                          )}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          label={({ name, percent }) =>
                            `${name.split(" ")[0]}\n${(percent * 100).toFixed(
                              0
                            )}%`
                          }
                          labelLine={{
                            stroke: "hsl(var(--muted-foreground))",
                            strokeWidth: 1,
                          }}
                        >
                          {data.latestTimings.doc.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                              strokeWidth={1}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number, name: string) => {
                            const percent = (
                              (value / latestLog.total_doc_time) *
                              100
                            ).toFixed(1);
                            const descriptions: { [key: string]: string } = {
                              "Path Resolution":
                                "Time spent locating the document",
                              "Content Extraction (direct)":
                                "Time spent reading and parsing the document",
                              "Content Caching":
                                "Time spent saving processed content",
                            };
                            return [
                              `${value.toFixed(2)}s (${percent}%)\n${
                                descriptions[name] || ""
                              }`,
                              name,
                            ];
                          }}
                          wrapperStyle={{ fontSize: "12px" }}
                        />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                          wrapperStyle={{
                            fontSize: "12px",
                            paddingTop: "20px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="document">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Document Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        data.documentMetrics[data.documentMetrics.length - 1],
                      ]}
                      layout="vertical"
                      margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={140}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          value.toFixed(1),
                          "Value",
                        ]}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))">
                        {Object.keys(data.documentMetrics[0]).map(
                          (_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          )
                        )}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Historical Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.processingTimes}
                      margin={{ top: 20, right: 30, left: 30, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="timestamp"
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        label={{
                          value: "Time (seconds)",
                          angle: -90,
                          position: "insideLeft",
                          offset: 10,
                        }}
                      />
                      <Tooltip
                        formatter={(value: number) => [
                          `${value.toFixed(1)}s`,
                          "Processing Time",
                        ]}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar
                        dataKey="llm_time"
                        name="LLM Processing"
                        fill={COLORS[0]}
                      />
                      <Bar
                        dataKey="doc_time"
                        name="Document Processing"
                        fill={COLORS[1]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
