"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface Model {
  id: string;
  name: string;
}

interface Provider {
  id: string;
  name: string;
  models: { [key: string]: string };
}

interface ModelsResponse {
  models: {
    [key: string]: { [key: string]: string };
  };
  default_provider: string;
  default_model: string;
}

export interface ModelSelection {
  model: string;
}

interface ModelSelectorProps {
  onModelSelect: (selection: ModelSelection) => void;
}

export default function ModelSelector({ onModelSelect }: ModelSelectorProps) {
  const [models, setModels] = useState<{ [key: string]: string }>({});
  const [selectedModel, setSelectedModel] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("/api/models");
        if (!response.ok) {
          throw new Error("Failed to fetch models");
        }
        const data = await response.json();

        // Flatten all models into a single object
        const allModels: { [key: string]: string } = {};
        Object.values(data.models).forEach((providerModels: any) => {
          Object.entries(providerModels).forEach(([id, name]) => {
            allModels[id] = name as string;
          });
        });

        setModels(allModels);

        // Set default model
        if (data.default_model && allModels[data.default_model]) {
          setSelectedModel(data.default_model);
          onModelSelect({ model: data.default_model });
        }
      } catch (error) {
        console.error("Error fetching models:", error);
        toast({
          title: "Error",
          description: "Failed to fetch available models",
          variant: "destructive",
        });
      }
    };

    fetchModels();
  }, []);

  const handleModelChange = useCallback(
    (value: string) => {
      setSelectedModel(value);
      onModelSelect({ model: value });
    },
    [onModelSelect]
  );

  if (Object.keys(models).length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <Label>Model</Label>
      <Select value={selectedModel} onValueChange={handleModelChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(models).map(([id, name]) => (
            <SelectItem key={id} value={id}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
