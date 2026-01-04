import { useState } from "react";
import { PaperPlaneIcon } from "../../../icons";
import Form from "../../../component/form/Form";
import ComponentCard from "../../../component/common/ComponentCard";
import Input from "../../../component/form/input/InputField";
import TextArea from "../../../component/form/input/TextArea";
import Label from "../../../component/form/Label";
import Select from "../../../component/form/Select";
import Button from "../../../component/ui/button/Button";
import DatePicker from "../../../component/form/date-picker";

export default function HasilPanenForm() {
    const [message, setMessage] = useState<string>("");
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // console.log data form here
        console.log("Form submitted:");
        console.log(e);
    };
    const options = [
        { value: "Kecil", label: "Kecil" },
        { value: "Menengah", label: "Menengah" },
        { value: "Besar", label: "Besar" },
    ];
    const handleSelectChange = (value: string) => {
        console.log("Selected value:", value);
    };

    const handleTextareaChange = (value: string) => {
        setMessage(value);
        console.log("Message:", value);
    };
    return (
        <ComponentCard title="Tambah Hasil Panen">
            <Form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="col-span-2 sm:col-span-1">
                        <DatePicker
                            id="dob-picker"
                            label="Tanggal Panen"
                            placeholder="Pilih tanggal panen"
                            onChange={(dates, currentDateString) => {
                                console.log({ dates, currentDateString });
                            }}
                        />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <Label htmlFor="harvestType">Jenis Panen</Label>
                        {/* <Input type="text" placeholder="Jenis Panen" id="harvestType" /> */}
                        <Select
                            options={options}
                            placeholder="Pilih Jenis Panen"
                            onChange={handleSelectChange}
                            defaultValue=""
                            className="bg-gray-50 dark:bg-gray-800"
                        />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <Label htmlFor="weight">Berat (kg)</Label>
                        <Input type="text" placeholder="Berat (kg)" id="weight" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <Label htmlFor="price">Harga</Label>
                        <Input type="text" placeholder="Harga (Rp.)" id="price" />
                    </div>
                    <div className="col-span-2">
                        <Label htmlFor="description">Keterangan</Label>
                        <TextArea
                            placeholder="Masukkan keterangan..."
                            rows={6}
                            value={message}
                            onChange={handleTextareaChange}
                            className=" bg-gray-50 dark:bg-gray-800"
                        />
                    </div>
                    <div className="col-span-2">
                        <Button size="sm" className="w-full">
                            Simpan
                            <PaperPlaneIcon className="size-5" />
                        </Button>
                    </div>
                </div>
            </Form>
        </ComponentCard>
    );
}
