import classNames from 'classnames'
import isEmpty from 'lodash/isEmpty'
import ReactSelect from 'react-select'
import makeAnimated from 'react-select/animated'
import CreatableSelect from 'react-select/creatable'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { FC, useEffect, useState } from 'react'
import ReactTextareaAutosize from 'react-textarea-autosize'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { Coffee, FileText, Minus, Plus, RefreshCcw, Save, User, X } from 'react-feather'

import TextField from '../TextField'
import useProject from '~/hooks/useProject'
import Input from '~/components/atoms/Input'
import { Roles } from '~/utils/constants/roles'
import useUserQuery from '~/hooks/useUserQuery'
import SpinnerIcon from '~/utils/icons/SpinnerIcon'
import { User as UserType } from '~/utils/types/userTypes'
import { ProjectDetails } from '~/utils/types/projectTypes'
import Button from '~/components/atoms/Buttons/ButtonAction'
import { changeShiftRequestSchema } from '~/utils/validation'
import { customStyles } from '~/utils/customReactSelectStyles'
import ModalTemplate from '~/components/templates/ModalTemplate'
import { changeShiftRequestFormValues } from '~/utils/types/formValues'
import ModalFooter from '~/components/templates/ModalTemplate/ModalFooter'
import ModalHeader from '~/components/templates/ModalTemplate/ModalHeader'
import { generateProjectsMultiSelect, generateUserSelect } from '~/utils/createLeaveHelpers'

type Props = {
  isOpen: boolean
  closeModal: () => void
}

const animatedComponents = makeAnimated()

const ChangeShiftRequestModal: FC<Props> = ({ isOpen, closeModal }): JSX.Element => {
  const [leaders, setLeaders] = useState<UserType[]>([])
  const [managers, setManagers] = useState<UserType[]>([])

  const { handleProjectQuery } = useProject()
  const { data: projects, isSuccess: isProjectsSuccess } = handleProjectQuery()

  const { handleAllUsersQuery } = useUserQuery()
  const { data: users, isSuccess: isUsersSuccess } = handleAllUsersQuery()

  useEffect(() => {
    if (isProjectsSuccess && projects.projects.length > 0) {
      const tempLeaders = [...leaders]
      projects?.projects.forEach((project) => {
        if (project?.projectLeader != null || project?.projectSubLeader != null) {
          if (!tempLeaders.some((leader) => leader.id === project.projectLeader.id))
            tempLeaders.push(project?.projectLeader)
          if (!tempLeaders.some((leader) => leader.id === project.projectSubLeader.id))
            tempLeaders.push(project?.projectSubLeader)
        }
      })
      setLeaders(tempLeaders)
    }
  }, [isProjectsSuccess, projects?.projects])

  useEffect(() => {
    if (isUsersSuccess) {
      const tempManager = users.allUsers.filter((user) => user.role.name === Roles.MANAGER)
      setManagers([...tempManager])
    }
  }, [isUsersSuccess])

  const emptyReactSelectOption = {
    label: '',
    value: ''
  }

  const {
    reset,
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<changeShiftRequestFormValues>({
    mode: 'onTouched',
    resolver: yupResolver(changeShiftRequestSchema)
  })

  const {
    fields: projectFields,
    remove: projectRemove,
    append: projectAppend
  } = useFieldArray({
    control,
    name: 'projects'
  })

  // This will handle Submit and Save New Overtime
  const handleSave = async (data: changeShiftRequestFormValues): Promise<void> => {
    return await new Promise((resolve) => {
      setTimeout(() => {
        alert(JSON.stringify(data, null, 2))
        resolve()
      }, 2000)
    })
  }

  // modify custom style control
  customStyles.control = (provided) => ({
    ...provided,
    boxShadow: 'none',
    borderColor: 'none',
    '&:hover': {
      color: '#75c55e'
    }
  })

  // This will reset all form values
  useEffect(() => {
    if (isOpen) {
      handleReset()
    }
  }, [isOpen])

  const handleReset = (): void => {
    reset({
      projects: [
        {
          project_name: emptyReactSelectOption,
          project_leader: emptyReactSelectOption
        }
      ],
      manager: emptyReactSelectOption,
      requested_time_in: '',
      requested_time_out: '',
      remarks: ''
    })
  }

  // Add Project
  const handleAddNewProject = (): void =>
    projectAppend({
      project_name: emptyReactSelectOption,
      project_leader: emptyReactSelectOption
    })

  // Remove Date
  const handleRemoveProject = (index: number): void => projectRemove(index)

  return (
    <ModalTemplate
      {...{
        isOpen,
        closeModal
      }}
      className="w-full max-w-[700px]"
    >
      <form
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onSubmit={handleSubmit(handleSave)}
      >
        {/* Custom Modal Header */}
        <ModalHeader
          {...{
            title: 'Change Shift Request',
            closeModal
          }}
        />
        <main className="grid grid-cols-2 gap-x-4 gap-y-6 py-6 px-8 text-xs text-slate-800">
          {/* Shift Request */}
          <section className="col-span-2">
            <label
              htmlFor="schedule-name"
              className={classNames(
                'flex flex-col space-y-0.5',
                !isEmpty(errors.requested_time_in) || !isEmpty(errors.requested_time_out)
                  ? 'mb-5'
                  : ''
              )}
            >
              <p className="shrink-0">
                Change Shift Time <span className="text-rose-500">*</span>
              </p>
              <div className="relative flex items-center space-x-2">
                <div className="w-1/2">
                  <Input
                    type="time"
                    disabled={isSubmitting}
                    {...register('requested_time_in')}
                    iserror={!isEmpty(errors.requested_time_in)}
                    className="w-full py-1.5 px-4 text-[13px] placeholder:text-slate-500"
                  />
                  {!isEmpty(errors.requested_time_in) && (
                    <p className="error absolute">{errors.requested_time_in.message}</p>
                  )}
                </div>
                <span>to</span>
                <div className="w-1/2">
                  <Input
                    type="time"
                    disabled={isSubmitting}
                    {...register('requested_time_out')}
                    iserror={!isEmpty(errors.requested_time_out)}
                    className="py-1.5 px-4 text-[13px] placeholder:text-slate-500"
                  />
                  {!isEmpty(errors.requested_time_out) && (
                    <p className="error absolute">{errors.requested_time_out.message}</p>
                  )}
                </div>
              </div>
            </label>
          </section>
          {/* Projects */}
          {projectFields.map((field, index) => (
            <div
              key={field.id}
              className={classNames(
                'col-span-2 flex w-full flex-wrap items-end justify-between',
                ' space-y-4 sm:space-x-2 md:space-y-0',
                (errors?.projects?.[index]?.project_name !== null &&
                  errors?.projects?.[index]?.project_name !== undefined) ||
                  (errors?.projects?.[index]?.project_leader !== null &&
                    errors?.projects?.[index]?.project_leader !== undefined)
                  ? 'pb-4'
                  : ''
              )}
            >
              <section className="w-full sm:w-[43%]">
                <TextField title={`Project ${index + 1}`} Icon={Coffee} isRequired>
                  <Controller
                    name={`projects.${index}.project_name` as any}
                    control={control}
                    render={({ field }) => {
                      return (
                        <CreatableSelect
                          {...field}
                          isClearable
                          placeholder=""
                          styles={customStyles}
                          closeMenuOnSelect={true}
                          classNames={{
                            control: (state) =>
                              state.isFocused
                                ? 'border-primary'
                                : errors.projects?.[index]?.project_name !== null &&
                                  errors.projects?.[index]?.project_name !== undefined
                                ? 'border-rose-500 ring-rose-500'
                                : 'border-slate-300'
                          }}
                          isDisabled={isSubmitting}
                          backspaceRemovesValue={true}
                          components={animatedComponents}
                          options={generateProjectsMultiSelect(
                            projects?.projects as ProjectDetails[]
                          )}
                          className="w-full"
                        />
                      )
                    }}
                  />
                </TextField>
                {errors.projects?.[index]?.project_name !== null &&
                  errors.projects?.[index]?.project_name !== undefined && (
                    <span className="error absolute text-[10px]">
                      Project {index + 1} name is required
                    </span>
                  )}
              </section>
              <section className="w-full flex-1">
                <TextField title="Project Leader" Icon={Coffee} isRequired>
                  <Controller
                    name={`projects.${index}.project_leader` as any}
                    control={control}
                    render={({ field }) => {
                      return (
                        <ReactSelect
                          {...field}
                          isClearable
                          placeholder=""
                          styles={customStyles}
                          closeMenuOnSelect={true}
                          isDisabled={isSubmitting}
                          classNames={{
                            control: (state) =>
                              state.isFocused
                                ? 'border-primary'
                                : errors.projects?.[index]?.project_leader !== null &&
                                  errors.projects?.[index]?.project_leader !== undefined
                                ? 'border-rose-500 ring-rose-500'
                                : 'border-slate-300'
                          }}
                          backspaceRemovesValue={true}
                          options={generateUserSelect(leaders)}
                          components={animatedComponents}
                          className="w-full"
                        />
                      )
                    }}
                  />
                </TextField>
                {errors.projects?.[index]?.project_leader !== null &&
                  errors.projects?.[index]?.project_leader !== undefined && (
                    <span className="error absolute text-[10px]">
                      Project leader {index + 1} is required
                    </span>
                  )}
              </section>

              <div className="ml-4 flex items-center space-x-2 sm:ml-0">
                <Button
                  type="button"
                  shadow="none"
                  onClick={() => handleRemoveProject(index)}
                  disabled={isSubmitting || projectFields?.length === 1}
                  className="!bg-white p-[11px]"
                >
                  <Minus className="h-4 w-4 stroke-1 text-slate-700" />
                </Button>
                <Button
                  type="button"
                  shadow="none"
                  onClick={handleAddNewProject}
                  disabled={isSubmitting}
                  className="!bg-white p-[11px]"
                >
                  <Plus className="h-4 w-4 stroke-1 text-slate-700" />
                </Button>
              </div>
            </div>
          ))}

          {/* Manager */}
          <section className="col-span-2">
            <TextField title="Manager" Icon={User} isRequired className="py-2.5 text-xs">
              <Controller
                name="manager"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <ReactSelect
                    {...field}
                    isClearable
                    placeholder=""
                    className="w-full"
                    styles={customStyles}
                    classNames={{
                      control: (state) =>
                        state.isFocused
                          ? 'border-primary'
                          : errors.manager !== null && errors.manager !== undefined
                          ? 'border-rose-500 ring-rose-500'
                          : 'border-slate-300'
                    }}
                    value={field.value}
                    onChange={field.onChange}
                    isDisabled={isSubmitting}
                    options={generateUserSelect(managers)}
                  />
                )}
              />
            </TextField>
            {errors.manager !== null && errors.manager !== undefined && (
              <span className="error text-[10px]">Manager is required</span>
            )}
          </section>

          {/* Remarks */}
          <section className="col-span-2">
            <TextField title="Remarks" Icon={FileText} isRequired>
              <ReactTextareaAutosize
                id="remarks"
                placeholder=""
                {...register('remarks')}
                className={classNames(
                  'text-area-auto-resize min-h-[14vh] pl-12',
                  errors?.remarks !== null && errors.remarks !== undefined
                    ? 'border-rose-500 ring-rose-500'
                    : ''
                )}
                disabled={isSubmitting}
              />
            </TextField>
            {errors.remarks !== null && errors.remarks !== undefined && (
              <span className="error text-[10px]">{errors.remarks?.message}</span>
            )}
          </section>
        </main>

        {/* Custom Modal Footer Style */}
        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-4 py-1 text-sm"
            onClick={handleReset}
          >
            <RefreshCcw className="h-4 w-4" />
            <span>Reset</span>
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={closeModal}
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-4 py-1 text-sm"
          >
            <X className="h-4 w-4" />
            <span>Cancel</span>
          </Button>
          <Button
            type="submit"
            variant="success"
            disabled={isSubmitting}
            className="flex items-center space-x-2 px-5 py-1 text-sm"
          >
            {isSubmitting ? (
              <>
                <SpinnerIcon className="h-3 w-3 fill-white" />
                <span>Saving..</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save</span>
              </>
            )}
          </Button>
        </ModalFooter>
      </form>
    </ModalTemplate>
  )
}

export default ChangeShiftRequestModal
