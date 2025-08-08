import React, { useState } from "react";
import { Container, Card, Button, Alert, Spinner, Form as RBForm } from "react-bootstrap";
import { useFormik } from "formik";
import { loginSchema } from "../schema/schema";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../api/api";

const LoginPage = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      is_admin: false,
    },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting }) => {
      setLoading(true);
      setError("");

      try {
        const response = await authAPI.login(values);
        const { access, refresh } = response.data;

        localStorage.setItem("access_token", access);
        localStorage.setItem("refresh_token", refresh);

        const tokenParts = access.split(".");
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const isAdmin = payload.is_superuser || payload.is_staff;

          if (values.is_admin && isAdmin) {
            window.location.href = "http://localhost:8000/admin/";
            return;
          } else if (values.is_admin && !isAdmin) {
            setError("You don't have administrator privileges");
            setLoading(false);
            setSubmitting(false);
            return;
          }

          navigate("/home");
        }
      } catch (err) {
        setError(
          err.response?.data?.detail || "Invalid credentials. Please try again."
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
      <div style={{ maxWidth: "400px", width: "100%" }}>
        <Card className="shadow">
          <Card.Header className="bg-primary text-white text-center">
            <h3 className="mb-0">Login</h3>
          </Card.Header>
          <Card.Body className="p-4">
            {error && <Alert variant="danger">{error}</Alert>}

            <RBForm onSubmit={formik.handleSubmit}>
              <div className="mb-3">
                <RBForm.Label>Username</RBForm.Label>
                <RBForm.Control
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.username && !!formik.errors.username}
                />
                <RBForm.Control.Feedback type="invalid">
                  {formik.errors.username}
                </RBForm.Control.Feedback>
              </div>

              <div className="mb-3">
                <RBForm.Label>Password</RBForm.Label>
                <RBForm.Control
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  isInvalid={formik.touched.password && !!formik.errors.password}
                />
                <RBForm.Control.Feedback type="invalid">
                  {formik.errors.password}
                </RBForm.Control.Feedback>
              </div>

              <div className="mb-3">
                <RBForm.Check
                  type="checkbox"
                  label="Login as Admin"
                  name="is_admin"
                  checked={formik.values.is_admin}
                  onChange={formik.handleChange}
                />
              </div>

              <Button
                type="submit"
                variant="primary"
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
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </RBForm>

            <div className="text-center mt-3">
              <p className="mb-0">
                Don't have an account?{" "}
                <a href="/register" className="text-decoration-none">
                  Register here
                </a>
              </p>
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default LoginPage;
