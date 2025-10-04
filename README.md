# Expense Management System

[cite_start]An automated expense management and reimbursement system designed to solve the challenges of manual expense processes which are often time-consuming, error-prone, and lack transparency[cite: 3]. [cite_start]This platform introduces dynamic, multi-level approval workflows to streamline expense reporting for companies[cite: 5, 6].

---

## Core Features

### Authentication & User Management
* [cite_start]On the first login or signup, a new `Company` and an `Admin User` are automatically created[cite: 11]. [cite_start]The company's currency is set based on the selected country[cite: 11].
* [cite_start]The **Admin** can create Employees and Managers[cite: 13].
* [cite_start]The **Admin** can assign and change user roles (Employee, Manager)[cite: 14].
* [cite_start]The **Admin** can define manager relationships for employees[cite: 15].

### Expense Submission (Employee Role)
* [cite_start]**Employees** can submit expense claims with details such as Amount, Category, Description, and Date[cite: 18, 19]. [cite_start]The expense amount can be in a different currency than the company's[cite: 18].
* [cite_start]**Employees** can view their own expense history, including `Approved` and `Rejected` claims[cite: 20].

### Approval Workflow (Manager/Admin Role)
* [cite_start]The system supports multi-level approval workflows where the Admin can define the sequence of approvers (e.g., Manager -> Finance -> Director)[cite: 6, 23, 26, 28, 31].
* [cite_start]An expense is first approved by the employee's manager if the "IS MANAGER APPROVER" field is checked[cite: 22].
* [cite_start]The expense claim moves to the next approver only after the current one approves or rejects it[cite: 32].
* [cite_start]**Managers** can view expenses that are waiting for their approval[cite: 34].
* [cite_start]**Managers** can approve or reject expenses and add comments[cite: 35]. [cite_start]When viewing an expense, the amount is visible in the company's default currency[cite: 44].

### Conditional Approval Flow
[cite_start]The approval rules are flexible and support conditional logic[cite: 7].
* [cite_start]**Percentage rule**: The expense is approved if a specified percentage of approvers (e.g., 60%) approve it[cite: 39].
* [cite_start]**Specific approver rule**: The expense is automatically approved if a specific approver (e.g., CFO) approves it[cite: 40].
* [cite_start]**Hybrid rule**: A combination of the percentage and specific approver rules can be used (e.g., 60% OR CFO approves)[cite: 41].
* [cite_start]These conditional flows can be combined with the multi-level approval workflow[cite: 42].

### Additional Features
* [cite_start]**OCR for Receipts**: Employees can scan a receipt, and an OCR algorithm will auto-generate the expense with all necessary fields like amount, date, description, and vendor name filled in[cite: 46, 47].

---

## Roles & Permissions

| Role      | Permissions                                                                                                         |
| :-------- | :------------------------------------------------------------------------------------------------------------------ |
| **Admin** | [cite_start]Create company (auto on signup), manage users, set roles, configure approval rules, view all expenses, override approvals[cite: 44]. |
| **Manager** | [cite_start]Approve/reject expenses (amount visible in company's default currency), view team expenses, escalate as per rules[cite: 44]. |
| **Employee** | [cite_start]Submit expenses, view their own expenses, check approval status[cite: 44].                                              |

---

## Technology Stack

* **Frontend**: React / Vue.js / Angular
* **Backend**: Node.js (Express.js) / Python (Django/Flask)
* **Database**: PostgreSQL / MongoDB
* **External APIs**:
    * [cite_start]Country & Currency Data: `https://restcountries.com/v3.1/all?fields=name,currencies` [cite: 48]
    * [cite_start]Currency Conversions: `https://api.exchangerate-api.com/v4/latest/{BASE_CURRENCY}` [cite: 48]

---

## Getting Started

### Prerequisites

* Node.js & npm
* Git

### Installation

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    cd your-repo-name
    ```
2.  **Install Backend Dependencies:**
    ```sh
    cd server
    npm install
    ```
3.  **Install Frontend Dependencies:**
    ```sh
    cd ../client
    npm install
    ```
4.  **Set up Environment Variables:**
    Create a `.env` file in the `server` directory and add your database credentials and API keys.

5.  **Run the application:**
    * Start the backend server: `npm start` (from the `server` directory)
    * Start the frontend application: `npm start` (from the `client` directory)

---

## Mockup

The UI/UX design is based on the following Excalidraw mockup:
* [cite_start][View Mockup](https://link.excalidraw.com/l/65VNwvy7c4X/4WSLZDTrhkA) [cite: 49]

---

## License

This project is licensed under the MIT License.
