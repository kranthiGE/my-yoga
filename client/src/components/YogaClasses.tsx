import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css";
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createYogaClass, deleteYogaClass, patchYogaClass, getYogaClasses } from '../api/yogaclasses-api'
import Auth from '../auth/Auth'
import { YogaClass } from '../types/YogaClass'
import { subDays } from 'date-fns'

interface YogaClassesProps {
  auth: Auth
  history: History
}

interface YogaClassesState {
  yogaclass: YogaClass[]
  newClassName: string
  classDescription: string
  loadingClasses: boolean
  scheduleDate: Date
}

export class YogaClasses extends React.PureComponent<YogaClassesProps, YogaClassesState> {
  state: YogaClassesState = {
    yogaclass: [],
    newClassName: '',
    classDescription: '',
    scheduleDate: new Date(this.calculateDueDate()),
    loadingClasses: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newClassName: event.target.value })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ classDescription: event.target.value })
  }

  handleScheduleDateChange = (date: any) => {
    this.setState({ scheduleDate: date})
  }

  onEditButtonClick = (classId: string) => {
    this.props.history.push(`/yogaclass/${classId}/edit`)
  }

  onYogaClassCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      
      if(!this.state.newClassName || this.state.newClassName.length == 0){
        alert('Yoga Class name can not be empty')
        return false
      }

      if(!this.state.classDescription || this.state.classDescription.length == 0){
        alert('Yoga Class description can not be empty')
        return false
      }

      if(!this.state.scheduleDate || this.state.scheduleDate == null){
        alert('Please provide scheduled date')
        return false
      }

      const newYogaClass = await createYogaClass(this.props.auth.getIdToken(), {
        name: this.state.newClassName,
        classDescription: this.state.classDescription,
        scheduleDate: this.state.scheduleDate.toISOString()
      })
      this.setState({
        yogaclass: [...this.state.yogaclass, newYogaClass],
        newClassName: ''
      })
      this.setState({ newClassName: '' })
      this.setState({ classDescription: '' })

    } catch {
      alert('Yoga Class creation failed')
    }
  }

  onYogaClassDelete = async (classId: string) => {
    try {
      await deleteYogaClass(this.props.auth.getIdToken(), classId)
      this.setState({
        yogaclass : this.state.yogaclass.filter(classy => classy.classId != classId)
      })
    } catch {
      alert('Yoga Class deletion failed')
    }
  }

  onYogaClassCheck = async (pos: number) => {
    try {
      const classy = this.state.yogaclass[pos]
      await patchYogaClass(this.props.auth.getIdToken(), classy.classId, {
        name: classy.name,
        classDescription: classy.classDescription,
        scheduleDate: classy.scheduleDate,
        done: (classy.done == 1 ? 0 : 1)
      })
      this.setState({
        yogaclass: update(this.state.yogaclass, {
          [pos]: { done: { $set: (classy.done == 1 ? 0 : 1) } }
        })
      })
    } catch {
      alert('Yoga class deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const yogaclass = await getYogaClasses(this.props.auth.getIdToken())
      this.setState({
        yogaclass,
        loadingClasses: false
      })
    } catch (e) {
      alert(`Failed to fetch classes: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Add New Yoga Class</Header>

        {this.renderCreateClassInput()}

        <Header as="h1">Yoga Classes</Header>

        {this.renderClasses()}
      </div>
    )
  }

  renderCreateClassInput() {
    return (
      <Grid.Row>
        <Grid.Column width={8}>
          Class Name:
          <Input
            
            actionPosition="left"
            placeholder="Yoga class name"
            onChange={this.handleNameChange} size="small"
          />
        </Grid.Column>
        <Grid.Column width={8}>
            Description:
            <Input
              fluid
              actionPosition="left"
              placeholder="description"
              onChange={this.handleDescriptionChange} size="large"
            />
        </Grid.Column>
        <Grid.Column>
          Schedule Date: 
          <DatePicker selected={this.state.scheduleDate} onChange={this.handleScheduleDateChange} minDate={subDays(new Date(), -2)} />
        </Grid.Column>
        <Grid.Column>

          <Button color="teal" action={{
            color: 'teal',
            labelPosition: 'left',
            icon: 'add',
          }}
          onClick={() => this.onYogaClassCreate}
          >
            Add Class
          </Button>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderClasses() {
    if (this.state.loadingClasses) {
      return this.renderLoading()
    }

    return this.renderClassesList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Classes
        </Loader>
      </Grid.Row>
    )
  }

  renderClassesList() {
    return (
      <Grid padded>
        {this.state.yogaclass.map((classy, pos) => {
          return (
            <Grid.Row key={classy.classId}>
              <Grid.Column width={4} verticalAlign="middle">
                {classy.attachmentUrl && (
                  <Image src={classy.attachmentUrl} size="small" wrapped />
                )}
                {classy.name}
              </Grid.Column>
              <Grid.Column width={8} verticalAlign="middle">
                {classy.classDescription}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {classy.scheduleDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(classy.classId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onYogaClassDelete(classy.classId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 2)

    return dateFormat(date, 'mm-dd-yyyy')
  }
}
