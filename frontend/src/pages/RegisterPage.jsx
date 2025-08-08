import React, { useState } from "react";
import { Container, Card, Button, Alert, Spinner, Form as RBForm } from "react-bootstrap";
import { useFormik } from "formik";
import { registerSchema } from "../schema/schema";
import { authAPI } from "../api/api";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      tenant_name: "",
      is_tenant_owner: false,
    },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setLoading(true);
      setError("");

      try {
        await authAPI.register(values);
        navigate("/login", {
          state: {
            message: "Registration successful! Please login with your credentials.",
          },
        });
      } catch (err) {
        setError(
          err.response?.data?.username?.[0] ||
            err.response?.data?.email?.[0] ||
            "Registration failed. Please try again."
        );
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <div style={{ maxWidth: "500px", width: "100%" }}>
        <Card className="shadow">
          <Card.Header className="bg-success text-white text-center">
            <h3 className="mb-0">Register</h3>
          </Card.Header>
          <Card.Body className="p-4">
            {error && <Alert variant="danger">{error}</Alert>}

            <RBForm onSubmit={formik.handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <RBForm.Label>Username *</RBForm.Label>
                  <RBForm.Control
                    type="text"
                    name="username"
                    placeholder="Enter username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.username && !!formik.errors.username}
                  />
                  <RBForm.Control.Feedback type="invalid">
                    {formik.errors.username}
                  </RBForm.Control.Feedback>
                </div>

                <div className="col-md-6 mb-3">
                  <RBForm.Label>Email *</RBForm.Label>
                  <RBForm.Control
                    type="email"
                    name="email"
                    placeholder="Enter email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.email && !!formik.errors.email}
                  />
                  <RBForm.Control.Feedback type="invalid">
                    {formik.errors.email}
                  </RBForm.Control.Feedback>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <RBForm.Label>Password *</RBForm.Label>
                  <RBForm.Control
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.password && !!formik.errors.password}
                  />
                  <RBForm.Control.Feedback type="invalid">
                    {formik.errors.password}
                  </RBForm.Control.Feedback>
                </div>

                <div className="col-md-6 mb-3">
                  <RBForm.Label>Confirm Password *</RBForm.Label>
                  <RBForm.Control
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={
                      formik.touched.confirmPassword && !!formik.errors.confirmPassword
                    }
                  />
                  <RBForm.Control.Feedback type="invalid">
                    {formik.errors.confirmPassword}
                  </RBForm.Control.Feedback>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6 mb-3">
                  <RBForm.Label>Tenant Name</RBForm.Label>
                  <RBForm.Control
                    type="text"
                    name="tenant_name"
                    placeholder="Enter tenant name"
                    value={formik.values.tenant_name}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    isInvalid={formik.touched.tenant_name && !!formik.errors.tenant_name}
                  />
                  <RBForm.Control.Feedback type="invalid">
                    {formik.errors.tenant_name}
                  </RBForm.Control.Feedback>
                </div>

                <div className="col-md-12 mb-3">
                  <RBForm.Check
                    type="checkbox"
                    label="Register as Tenant Owner"
                    name="is_tenant_owner"
                    checked={formik.values.is_tenant_owner}
                    onChange={formik.handleChange}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="success"
                className="w-100"
                disabled={formik.isSubmitting || loading || !formik.isValid}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </RBForm>

            <div className="text-center mt-3">
              <p className="mb-0">
                Already have an account?{" "}
                <a href="/login" className="text-decoration-none">
                  Login here
                </a>
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default RegisterPage;
