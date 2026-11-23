import { Form, Input, Button, Select, Space, Spin } from "antd";
import { GuestInput } from "../../api/guestHooks";
import { Member } from "../../api/types";
import { memberName } from "../../lib/labels";

interface GuestFormProps {
  initial?: GuestInput;
  hostMember?: Member;
  hosts?: Member[];
  onSubmit: (data: GuestInput) => Promise<void>;
  readOnly?: boolean;
  isLoading?: boolean;
  onCancel?: () => void;
  submitLabel?: string;
}

export function GuestForm({
  initial,
  hostMember,
  hosts,
  onSubmit,
  readOnly = false,
  isLoading = false,
  onCancel,
  submitLabel = "Save Guest",
}: GuestFormProps) {
  const [form] = Form.useForm();
  const pickHost = !hostMember && hosts !== undefined;

  return (
    <Spin spinning={isLoading}>
      <Form
        layout="vertical"
        form={form}
        initialValues={
          initial || {
            firstName: "",
            surname: "",
            telephone: "",
            email: "",
            comments: "",
            guestOf: hostMember?._id,
          }
        }
        onFinish={onSubmit}
      >
        <Form.Item
          label="First Name"
          name="firstName"
          rules={[{ required: true, message: "First name is required" }]}
        >
          <Input placeholder="Enter first name" disabled={readOnly} />
        </Form.Item>

        <Form.Item
          label="Last Name"
          name="surname"
          rules={[{ required: true, message: "Last name is required" }]}
        >
          <Input placeholder="Enter last name" disabled={readOnly} />
        </Form.Item>

        <Form.Item label="Telephone" name="telephone">
          <Input placeholder="Enter telephone number" disabled={readOnly} />
        </Form.Item>

        <Form.Item label="Email" name="email">
          <Input type="email" placeholder="Enter email" disabled={readOnly} />
        </Form.Item>

        <Form.Item label="Comments" name="comments">
          <Input.TextArea placeholder="Add any notes about this guest" disabled={readOnly} rows={3} />
        </Form.Item>

        {pickHost ? (
          <Form.Item label="Host member" name="guestOf" rules={[{ required: true, message: "Choose a host member" }]}>
            <Select
              showSearch
              disabled={readOnly}
              placeholder="Choose the member this guest belongs to"
              optionFilterProp="label"
              options={hosts!.map((member) => ({ value: String(member._id), label: memberName(member) }))}
            />
          </Form.Item>
        ) : (
          <Form.Item name="guestOf" hidden>
            <Input />
          </Form.Item>
        )}

        {!readOnly && (
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                {submitLabel}
              </Button>
              {onCancel && (
                <Button onClick={onCancel} disabled={isLoading}>
                  Cancel
                </Button>
              )}
            </Space>
          </Form.Item>
        )}
      </Form>
    </Spin>
  );
}
