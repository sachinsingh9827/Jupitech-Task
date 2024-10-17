import React, { Component } from "react";
import axios from "axios";
import './Form.css'; // Assuming you create a CSS file for styles

// FormListItem Component
const FormListItem = ({ classItem }) => {
  return (
    <div className="class-item">
      <strong>{classItem.title}</strong> -{" "}
      {classItem.date || "No Date"} - {classItem.body}
    </div>
  );
};

// FormListActions Component
const FormListActions = ({ onEdit, onDelete }) => {
  return (
    <div className="actions">
      <button onClick={onEdit} className="btn btn-warning me-2">
        Edit
      </button>
      <button onClick={onDelete} className="btn btn-danger">
        Delete
      </button>
    </div>
  );
};

// Main Form Component
class Form extends Component {
  constructor(props) {
    super(props);
    this.state = {
      className: "",
      date: "",
      subjects: "",
      classList: [],
      isEditing: false,
      currentIndex: null,
      errors: {
        className: "",
        date: "",
        subjects: "",
      },
    };
  }

  componentDidMount() {
    // Fetch class list from fake API (GET request)
    axios
      .get("https://jsonplaceholder.typicode.com/posts")
      .then((response) => {
        this.setState({ classList: response.data.slice(0, 5) }); // Get first 5 items for example
      })
      .catch((error) => {
        console.error("There was an error fetching the class list!", error);
      });
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value, errors: { ...this.state.errors, [name]: "" } });
  };

  validate = () => {
    const { className, date, subjects } = this.state;
    const errors = {};
    let isValid = true;

    // Validate Class Name
    if (!className) {
      errors.className = "Class Name is required";
      isValid = false;
    }

    // Validate Date
    if (!date) {
      errors.date = "Date is required";
      isValid = false;
    }

    // Validate Subjects
    if (!subjects) {
      errors.subjects = "Subjects are required";
      isValid = false;
    }

    this.setState({ errors });
    return isValid;
  };

  handleSubmit = (event) => {
    event.preventDefault();
    const { className, date, subjects, isEditing, currentIndex, classList } = this.state;

    if (!this.validate()) {
      return; // Stop submission if validation fails
    }

    const newClass = { title: className, body: subjects, date };

    if (isEditing) {
      // Update class (PUT request)
      axios
        .put(`https://jsonplaceholder.typicode.com/posts/${currentIndex + 1}`, newClass)
        .then((response) => {
          const updatedClasses = classList.map((classItem, index) =>
            index === currentIndex ? response.data : classItem
          );
          this.setState({
            classList: updatedClasses,
            isEditing: false,
            currentIndex: null,
            className: "",
            date: "",
            subjects: "",
          });
        })
        .catch((error) => {
          console.error("There was an error updating the class!", error);
        });
    } else {
      // Add new class (POST request)
      axios
        .post("https://jsonplaceholder.typicode.com/posts", newClass)
        .then((response) => {
          this.setState((prevState) => ({
            classList: [...prevState.classList, response.data],
            className: "",
            date: "",
            subjects: "",
          }));
        })
        .catch((error) => {
          console.error("There was an error adding the class!", error);
        });
    }
  };

  handleEdit = (index) => {
    const classItem = this.state.classList[index];
    this.setState({
      className: classItem.title,
      date: classItem.date || "",
      subjects: classItem.body,
      isEditing: true,
      currentIndex: index,
    }, () => {
      // Scroll to the top of the page after updating the state
      window.scrollTo(0, 0);
    });
  };

  handleDelete = (index) => {
    // Delete class (DELETE request)
    axios
      .delete(`https://jsonplaceholder.typicode.com/posts/${index + 1}`)
      .then(() => {
        const filteredList = this.state.classList.filter((_, i) => i !== index);
        this.setState({ classList: filteredList });
      })
      .catch((error) => {
        console.error("There was an error deleting the class!", error);
      });
  };

  render() {
    const { className, date, subjects, classList, isEditing, errors } = this.state;

    return (
      <div className="container my-5">
        <div className="form-card">
          <h2 className="card-title text-center mb-4">
            {isEditing ? "Edit Class" : "Add New Class"}
          </h2>
          <form onSubmit={this.handleSubmit}>
            <div className="form-group">
              <label>Class Name:</label>
              <input
                type="text"
                name="className"
                value={className}
                onChange={this.handleInputChange}
                className="form-control"
              />
              {errors.className && <small className="text-danger">{errors.className}</small>}
            </div>
            <div className="form-group">
              <label>Date:</label>
              <input
                type="date"
                name="date"
                value={date}
                onChange={this.handleInputChange}
                className="form-control"
              />
              {errors.date && <small className="text-danger">{errors.date}</small>}
            </div>
            <div className="form-group">
              <label>Subjects:</label>
              <input
                type="text"
                name="subjects"
                value={subjects}
                onChange={this.handleInputChange}
                className="form-control"
              />
              {errors.subjects && <small className="text-danger">{errors.subjects}</small>}
            </div>
            <button type="submit" className="btn btn-primary w-100 mt-3">
              {isEditing ? "Update Class" : "Add Class"}
            </button>
          </form>
        </div>

        {/* Class List */}
        <div className="class-list mt-5">
          <h3 className="mb-4">Class List</h3>
          <ul className="list-group">
            {classList.length === 0 ? (
              <li className="list-group-item">No classes available.</li>
            ) : (
              classList.map((classItem, index) => (
                <li
                  key={classItem.id || index} // Use a unique identifier if available
                  className="list-group-item d-flex justify-content-between align-items-center"
                >
                  <FormListItem classItem={classItem} />
                  <FormListActions
                    onEdit={() => this.handleEdit(index)}
                    onDelete={() => this.handleDelete(index)}
                  />
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    );
  }
}

export default Form;
