function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function buildError(fieldErrors) {
  return {
    flatten() {
      return { fieldErrors };
    },
  };
}

export function validateLogin(data) {
  const fieldErrors = {};

  if (!isNonEmptyString(data?.email)) {
    fieldErrors.email = ['Email is required'];
  }

  if (!isNonEmptyString(data?.password)) {
    fieldErrors.password = ['Password is required'];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: buildError(fieldErrors) };
  }

  return {
    success: true,
    data: {
      email: data.email.trim().toLowerCase(),
      password: data.password,
    },
  };
}

export function validateSignup(data) {
  const fieldErrors = {};

  if (!isNonEmptyString(data?.name) || data.name.trim().length < 2) {
    fieldErrors.name = ['Name must be at least 2 characters'];
  }

  if (!isNonEmptyString(data?.email)) {
    fieldErrors.email = ['Email is required'];
  } else {
    const email = data.email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      fieldErrors.email = ['Enter a valid email address'];
    }
  }

  if (!isNonEmptyString(data?.password) || data.password.length < 8) {
    fieldErrors.password = ['Password must be at least 8 characters'];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, error: buildError(fieldErrors) };
  }

  return {
    success: true,
    data: {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
    },
  };
}
