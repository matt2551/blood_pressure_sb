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

type Reading = {
  id: string;
  systolic: number;
  diastolic: number;
  pulse: number | null;
  arm: string | null;
  position: string | null;
  notes: string | null;
  reading_date: string;
};

type EditReadingFormProps = {
  reading: Reading;
  userId: string;
  onSave: () => void;
  onCancel: () => void;
};

export default function EditReadingForm({ reading, userId, onSave, onCancel }: EditReadingFormProps) {
  const [systolic, setSystolic] = useState(String(reading.systolic));
  const [diastolic, setDiastolic] = useState(String(reading.diastolic));
  const [pulse, setPulse] = useState(reading.pulse != null ? String(reading.pulse) : "");
  const [arm, setArm] = useState(reading.arm ?? "left");
  const [position, setPosition] = useState(reading.position ?? "sitting");
  const [notes, setNotes] = useState(reading.notes ?? "");
  const [readingDate, setReadingDate] = useState(() => {
    const d = new Date(reading.reading_date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });

  const { run: updateReading, loading } = useApi("UpdateReading");

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const sys = parseInt(systolic, 10);
      const dia = parseInt(diastolic, 10);
      if (isNaN(sys) || isNaN(dia)) {
        toast.error("Systolic and Diastolic are required");
        return;
      }
      if (sys < 50 || sys > 300 || dia < 20 || dia > 200) {
        toast.error("Please enter valid blood pressure values");
        return;
      }
      const p = pulse ? parseInt(pulse, 10) : null;

      try {
        await updateReading({
          readingId: reading.id,
          userId,
          systolic: sys,
          diastolic: dia,
          pulse: p,
          arm,
          position,
          notes: notes.trim() || null,
          readingDate: new Date(readingDate).toISOString(),
        });
        toast.success("Reading updated!");
        onSave();
      } catch (error) {
        const message =
          error && typeof error === "object" && "message" in error
            ? String((error as { message: unknown }).message)
            : String(error);
        toast.error("Update failed: " + message);
      }
    },
    [systolic, diastolic, pulse, arm, position, notes, readingDate, reading.id, userId, updateReading, onSave]
  );

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon icon="pencil" className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold">Edit Reading</h2>
        <span className="text-xs text-muted-foreground ml-auto">
          {new Date(reading.reading_date).toLocaleString()}
        </span>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Systolic (mmHg) *</Label>
            <Input type="number" value={systolic} onChange={(e) => setSystolic(e.target.value)} min={50} max={300} />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Diastolic (mmHg) *</Label>
            <Input type="number" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} min={20} max={200} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Pulse (bpm)</Label>
          <Input type="number" value={pulse} onChange={(e) => setPulse(e.target.value)} min={30} max={220} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Arm</Label>
            <Select value={arm} onValueChange={setArm}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs">Position</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sitting">Sitting</SelectItem>
                <SelectItem value="standing">Standing</SelectItem>
                <SelectItem value="lying">Lying</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Date & Time</Label>
          <Input type="datetime-local" value={readingDate} onChange={(e) => setReadingDate(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-xs">Notes</Label>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional notes…" />
        </div>
        <div className="flex gap-2 mt-1">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? "Saving…" : "Save Changes"}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
