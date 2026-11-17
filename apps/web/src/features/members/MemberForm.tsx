import { Button, DatePicker, Form, Input, Select } from "antd";
import dayjs from "dayjs";
import { Member, MemberInput } from "../../api/types";

export function MemberForm({ initial, onSubmit }: { initial?: Member; onSubmit: (values: MemberInput) => Promise<void> | void }) {
  return (
    <Form
      layout="vertical"
      requiredMark={false}
      initialValues={{
        ...initial,
        birthday: initial?.birthday ? dayjs(initial.birthday) : undefined,
        programs: initial?.programs || [],
      }}
      onFinish={async (values) => {
        await onSubmit({
          ...values,
          birthday: values.birthday?.format("YYYY-MM-DD") || "",
          programs: values.programs || [],
        });
      }}
    >
      <p className="form-label">Name</p>
      <div className="split">
        <Form.Item name="firstName" label="First name">
          <Input />
        </Form.Item>
        <Form.Item name="surname" label="Surname">
          <Input />
        </Form.Item>
      </div>
      <div className="split">
        <Form.Item name="fatherName" label="Father's name">
          <Input />
        </Form.Item>
        <Form.Item name="birthday" label="Birthday">
          <DatePicker className="full" />
        </Form.Item>
      </div>
      <Form.Item name="gender" label="Gender">
        <Select
          allowClear
          placeholder="Not set"
          options={[
            { value: "MALE", label: "Male" },
            { value: "FEMALE", label: "Female" },
          ]}
        />
      </Form.Item>
      <p className="form-label">Contact</p>
      <div className="split">
        <Form.Item name="telephone" label="Telephone">
          <Input />
        </Form.Item>
        <Form.Item name="email" label="Email">
          <Input />
        </Form.Item>
      </div>
      <Form.Item name="address" label="Address">
        <Input />
      </Form.Item>
      <p className="form-label">Community</p>
      <div className="split">
        <Form.Item name="jewishStatus" label="Jewish status">
          <Input />
        </Form.Item>
        <Form.Item name="minyanAttendance" label="Minyan attendance">
          <Input />
        </Form.Item>
      </div>
      <Form.Item name="programs" label="Programs">
        <Select mode="tags" placeholder="Add a program and press enter" />
      </Form.Item>
      <Form.Item name="comments" label="Comments">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item name="comments2" label="Additional comments">
        <Input.TextArea rows={3} />
      </Form.Item>
      <Form.Item name="documentLocation" label="Document location">
        <Input />
      </Form.Item>
      <Button type="primary" htmlType="submit">
        Save member
      </Button>
    </Form>
  );
}
