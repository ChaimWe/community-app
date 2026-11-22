import { Form, Input, Button, Space, Spin } from "antd";
import { GuestInput } from "../../api/guestHooks";
import { Member } from "../../api/types";

interface GuestFormProps {
  initial?: GuestInput;
  hostMember: Member;
  onSubmit: (data: GuestInput) => Promise<void>;
  readOnly?: boolean;
  isLoading?: boolean;
}

export function GuestForm({ initial, hostMember, onSubmit, readOnly = false, isLoading = false }: GuestFormProps) {
  const [form] = Form.useForm();

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
            guestOf: hostMember._id,
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

        <Form.Item name="guestOf" hidden>
          <Input />
        </Form.Item>

        {!readOnly && (
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={isLoading}>
                Save Guest
              </Button>
            </Space>
          </Form.Item>
        )}
      </Form>
    </Spin>
  );
}
