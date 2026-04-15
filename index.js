const form = document.querySelector('#crmRequestForm');
const submitBanner = document.querySelector('#submitBanner');
const resultPanel = document.querySelector('#resultPanel');
const resultGrid = document.querySelector('#resultGrid');
const approvalModal = document.querySelector('#approvalModal');
const approvalModalMessage = document.querySelector('#approvalModalMessage');
const approvalCancelButton = document.querySelector('#approvalCancelButton');
const approvalConfirmButton = document.querySelector('#approvalConfirmButton');
const mobileReportRadios = document.querySelectorAll('input[name="mobileReport"]');
const grossProfitYes = document.querySelector('input[name="grossProfit"][value="是"]');
const grossProfitNo = document.querySelector('input[name="grossProfit"][value="否"]');
const grossProfitRadios = document.querySelectorAll('input[name="grossProfit"]');
let pendingPayload = null;

const summaryFields = [
  ['用户姓名', 'userName'],
  ['手机号', 'phone'],
  ['邮箱', 'email'],
  ['所属组织关系 / 部门', 'department'],
  ['覆盖门店', 'stores'],
  ['开通手机报表', 'mobileReport'],
  ['可查看毛利', 'grossProfit'],
  ['开通会员管理', 'memberManagement'],
  ['开通活动预约管理', 'appointmentManagement'],
  ['开通客户数据报表', 'customerReport'],
  ['开通 CCMD', 'ccmd'],
  ['开通忠诚度管理 - 圈人发券功能', 'loyaltyCoupon'],
  ['开通 Adhoc 自主分析工具', 'adhoc'],
  ['开通微伴助手', 'wecomAssistant']
];

function getSelectedValue(fieldName) {
  const checkedField = form.querySelector(`input[name="${fieldName}"]:checked`);
  return checkedField ? checkedField.value : '否';
}

function syncGrossProfitState() {
  const isMobileReportEnabled = getSelectedValue('mobileReport') === '是';

  grossProfitRadios.forEach((radio) => {
    radio.disabled = !isMobileReportEnabled;
  });

  if (!isMobileReportEnabled) {
    grossProfitNo.checked = true;
  } else if (!grossProfitYes.checked && !grossProfitNo.checked) {
    grossProfitYes.checked = true;
  }
}

function formatStores(value) {
  return value
    .split(/\n|,|，|、/)
    .map((store) => store.trim())
    .filter(Boolean)
    .join(' / ');
}

function renderSummary(payload) {
  resultGrid.innerHTML = '';

  summaryFields.forEach(([label, key]) => {
    const labelNode = document.createElement('div');
    labelNode.className = 'result-label';
    labelNode.textContent = label;

    const valueNode = document.createElement('div');
    valueNode.className = 'result-value';
    valueNode.textContent = payload[key];

    resultGrid.append(labelNode, valueNode);
  });

  resultPanel.classList.add('show');
}

function collectPayload() {
  return {
    userName: form.userName.value.trim(),
    phone: form.phone.value.trim(),
    email: form.email.value.trim(),
    department: form.department.value.trim(),
    stores: formatStores(form.stores.value.trim()),
    mobileReport: getSelectedValue('mobileReport'),
    grossProfit: getSelectedValue('grossProfit'),
    memberManagement: getSelectedValue('memberManagement'),
    appointmentManagement: getSelectedValue('appointmentManagement'),
    customerReport: getSelectedValue('customerReport'),
    ccmd: getSelectedValue('ccmd'),
    loyaltyCoupon: getSelectedValue('loyaltyCoupon'),
    adhoc: getSelectedValue('adhoc'),
    wecomAssistant: getSelectedValue('wecomAssistant')
  };
}

function closeApprovalModal() {
  approvalModal.classList.remove('show');
  approvalModal.setAttribute('aria-hidden', 'true');
  approvalModalMessage.textContent = '';
  pendingPayload = null;
}

function completeSubmission(payload) {
  renderSummary(payload);
  submitBanner.textContent = `申请已提交。申请人 ${payload.userName} 的 CRM 开账号请求已生成页面预览。`;
  submitBanner.classList.add('show');
}

function openApprovalModal(payload) {
  const approvalItems = [];

  if (payload.ccmd === '是') {
    approvalItems.push('CCMD');
  }

  if (payload.wecomAssistant === '是') {
    approvalItems.push('微伴助手');
  }

  approvalModalMessage.textContent = `${payload.userName}，您好。您本次申请中包含${approvalItems.join('、')}权限，系统会将此次需要的权限提交给审批人。请确认是否继续提交。`;
  pendingPayload = payload;
  approvalModal.classList.add('show');
  approvalModal.setAttribute('aria-hidden', 'false');
}

mobileReportRadios.forEach((radio) => {
  radio.addEventListener('change', syncGrossProfitState);
});

form.addEventListener('reset', () => {
  window.setTimeout(() => {
    submitBanner.classList.remove('show');
    submitBanner.textContent = '';
    resultGrid.innerHTML = '';
    resultPanel.classList.remove('show');
    closeApprovalModal();
    syncGrossProfitState();
  }, 0);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const payload = collectPayload();
  const requiresApproval = payload.ccmd === '是' || payload.wecomAssistant === '是';

  if (requiresApproval) {
    openApprovalModal(payload);
    return;
  }

  completeSubmission(payload);
});

approvalCancelButton.addEventListener('click', closeApprovalModal);

approvalConfirmButton.addEventListener('click', () => {
  if (!pendingPayload) {
    return;
  }

  const payload = pendingPayload;
  closeApprovalModal();
  completeSubmission(payload);
});

approvalModal.addEventListener('click', (event) => {
  if (event.target === approvalModal) {
    closeApprovalModal();
  }
});

syncGrossProfitState();
