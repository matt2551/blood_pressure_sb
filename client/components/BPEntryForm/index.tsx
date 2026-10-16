import { useState, useCallback } from "react";
import { useApi } from "@/hooks/useApi.js";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import { toast } from "sonner";

type BPEntryFormProps = {
  userId: string;
  onSuccess: () => void;
};

export default function BPEntryForm({ userId, onSuccess }: BPEntryFormProps) {
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [arm, setArm] = useState("left");
  const [position, setPosition] = useState("sitting");
  const [notes, setNotes] = useState("");
  const [readingDate, setReadingDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });

  const { run: addReading, loading } = useApi("AddReading");

  const resetForm = useCallback(() => {
    setSystolic("");
    setDiastolic("");
    setPulse("");
    setNotes("");
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setReadingDate(now.toISOString().slice(0, 16));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const sys = parseInt(systolic, 10);
      const dia = parseInt(diastolic, 10);
      if (isNaN(sys) || isNaN(dia)) {
        toast.error("Systolic and Diastolic are required numbers");
        return;
      }
      if (sys < 50 || sys > 300 || dia < 20 || dia > 200) {
        toast.error("Please enter valid blood pressure values");
        return;
      }
      const p = pulse ? parseInt(pulse, 10) : null;

      try {
        await addReading({
          userId,
          systolic: sys,
          diastolic: dia,
          pulse: p,
          arm,
          position,
          notes: notes.trim() || null,
          readingDate: new Date(readingDate).toISOString(),
        });
        toast.success("Reading saved!");
        resetForm();
        onSuccess();
      } catch (error) {
        const message =
          error && typeof error === "object" && "message" in error
            ? String((error as { message: unknown }).message)
            : String(error);
        toast.error("Failed to save: " + message);
      }
    },
    [systolic, diastolic, pulse, arm, position, notes, readingDate, userId, addReading, resetForm, onSuccess]
  );

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon icon="plus-circle" className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">New Reading</h2>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="systolic" className="text-xs">
              Systolic (mmHg) *
            </Label>
            <Input
              id="systolic"
              type="number"
              placeholder="120"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              min={50}
              max={300}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="diastolic" className="text-xs">
              Diastolic (mmHg) *
            </Label>
            <Input
              id="diastolic"
              type="number"
              placeholder="80"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              min={20}
              max={200}
            />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="pulse" className="text-xs">
            Pulse (bpm)
          </Label>
          <Input
            id="pulse"
            type="number"
            placeholder="72"
            value={pulse}
            onChange={(e) => setPulse(e.target.value)}
            min={30}
            max={220}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Arm</Label>
            <Select value={arm} onValueChange={setArm}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Position</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sitting">Sitting</SelectItem>
                <SelectItem value="standing">Standing</SelectItem>
                <SelectItem value="lying">Lying</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="readingDate" className="text-xs">
            Date & Time
          </Label>
          <Input
            id="readingDate"
            type="datetime-local"
            value={readingDate}
            onChange={(e) => setReadingDate(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="notes" className="text-xs">
            Notes
          </Label>
          <Textarea
            id="notes"
            placeholder="Optional notes…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>
        <Button type="submit" disabled={loading} className="mt-1">
          {loading ? "Saving…" : "Save Reading"}
        </Button>
      </form>
    </Card>
  );
}
