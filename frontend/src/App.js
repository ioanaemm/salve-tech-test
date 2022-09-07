import React, { useState, useEffect } from "react";
import axios from "axios";
import "antd/dist/antd.less";
import logo from "./salve_logo.svg";

import { Table, Select } from "antd";
import "./App.scss";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [clinics, setClinics] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedClinic, setSelectedClinic] = useState();

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    setIsLoading(true);
    try {
      const { data: response } = await axios.get(
        "https://mhjtztb6nwwoaqprvmq2hu5ge40wsttr.lambda-url.eu-west-2.on.aws/clinics"
      );
      setClinics(response);
      onClinicChange(response[0].id);
    } catch (error) {
      console.log(error.message);
    }
    setIsLoading(false);
  };

  async function onClinicChange(value) {
    setIsLoading(true);
    setSelectedClinic(value);
    const { data: response } = await axios.get(
      `https://mhjtztb6nwwoaqprvmq2hu5ge40wsttr.lambda-url.eu-west-2.on.aws/clinics/${value}/patients`
    );
    setPatients(response);
    setIsLoading(false);
  }

  const columns = [
    {
      title: "First Name",
      dataIndex: "first_name",
      key: "first_name",
      sorter: (a, b) => (a.first_name < b.first_name ? 1 : -1),
      ellipsis: true,
    },
    {
      title: "Last Name",
      dataIndex: "last_name",
      key: "last_name",
      sorter: (a, b) => (a.last_name < b.last_name ? 1 : -1),
      ellipsis: true,
    },
    {
      title: "Date of birth",
      dataIndex: "date_of_birth",
      key: "date_of_birth",
      sorter: (a, b) => (a.date_of_birth < b.date_of_birth ? 1 : -1),
      ellipsis: true,
    },
  ];

  return (
    <div className="app">
      <div className="header">
        <img src={logo} className="app-logo" alt="logo" />
      </div>
      <div className="info">
        <h1 className="title">
          Transform patient experience.
          <br />
          Build trust. Boost revenue.
        </h1>
        <h3 className="subtitle">
          Fertility patients are often going through a challenging time – but with Salve, you can make sure their
          experience is the best it can possibly be. You can simplify the treatment process, provide continuous
          reassurance and minimize uncertainty. An outstanding patient experience builds trust in your clinic and
          improves retention.
        </h3>
      </div>

      <div className="clinic-selector-container">
        <h3 className="clinic-label">Clinic:</h3>
        <Select
          data-cy="clinic-selector"
          className="clinic-selector"
          value={selectedClinic}
          onChange={onClinicChange}
          style={{ width: 200 }}
          placeholder="Choose a clinic"
        >
          {clinics.map((clinic) => (
            <Select.Option value={clinic.id}>{clinic.name}</Select.Option>
          ))}
        </Select>
      </div>
      <Table columns={columns} dataSource={patients} loading={isLoading} data-cy="patients-table" />
    </div>
  );
}

export default App;
