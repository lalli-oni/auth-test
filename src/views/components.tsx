import type { FC, PropsWithChildren } from 'hono/jsx';

export const Alert: FC<{ error?: string; success?: string }> = ({
  error,
  success,
}) => (
  <div id="alert-container">
    {error && <div class="alert alert-error">{error}</div>}
    {success && <div class="alert alert-success">{success}</div>}
  </div>
);

export const AuthCard: FC<PropsWithChildren<{ title: string }>> = ({
  title,
  children,
}) => (
  <div class="auth-form-container">
    <h2>{title}</h2>
    {children}
  </div>
);

export const FormGroup: FC<
  PropsWithChildren<{ label: string; htmlFor: string }>
> = ({ label, htmlFor, children }) => (
  <div class="form-group">
    <label for={htmlFor}>{label}</label>
    {children}
  </div>
);

export const PasswordInput: FC<{
  id: string;
  name: string;
  autocomplete: string;
  required?: boolean;
  minlength?: number;
}> = ({ id, name, autocomplete, required, minlength }) => (
  <div class="password-wrapper">
    <input
      type="password"
      id={id}
      name={name}
      autocomplete={autocomplete}
      required={required}
      minlength={minlength}
    />
    <button
      type="button"
      class="password-toggle"
      aria-label="Toggle password visibility"
      data-target={id}
    >
      Show
    </button>
  </div>
);

export const ComboButton: FC<
  PropsWithChildren<{
    primaryLabel: string;
    primaryHref?: string;
    primaryOnclick?: string;
    primaryTitle?: string;
    btnStyle?: string;
  }>
> = ({
  primaryLabel,
  primaryHref,
  primaryOnclick,
  primaryTitle,
  btnStyle = 'btn-primary',
  children,
}) => (
  <div class="combo-btn">
    {primaryHref ? (
      <a
        href={primaryHref}
        class={`btn ${btnStyle} combo-btn-main`}
        title={primaryTitle}
      >
        {primaryLabel}
      </a>
    ) : (
      <button
        type="button"
        onclick={primaryOnclick}
        class={`btn ${btnStyle} combo-btn-main`}
        title={primaryTitle}
      >
        {primaryLabel}
      </button>
    )}
    <button
      type="button"
      class={`btn ${btnStyle} combo-btn-toggle`}
      onclick="this.parentElement.classList.toggle('open')"
    >
      &#9662;
    </button>
    <div class="combo-btn-dropdown">{children}</div>
  </div>
);

export const VariantPicker: FC<PropsWithChildren> = ({ children }) => (
  <div class="variant-picker">{children}</div>
);

export const OtpInput: FC<{
  id: string;
  name: string;
  autofocus?: boolean;
}> = ({ id, name, autofocus }) => (
  <input
    type="text"
    id={id}
    name={name}
    autocomplete="one-time-code"
    inputmode="numeric"
    pattern="[0-9]{6}"
    maxlength={6}
    required
    placeholder="000000"
    autofocus={autofocus}
  />
);
