import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/Form"
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from "react"
import { IconX } from "@tabler/icons-react"
import { QUESTION_CATEGORY } from "@/data/const/api_url"
import { useMutationAction } from "@/data/hooks/api/useGlobalFetch"
import { questioniGroupSchema, type QuestionCategoryDataType, type QuestionGroupDataType, type QuestionGroupType } from "@/data/validations/question_schema"

type ComponentProps = { isEdit?: boolean, questionCategory?: QuestionCategoryDataType}

export default function QuestionCategoryModalCreate({ isEdit = false, questionCategory }: ComponentProps) {
    const closeForm = () => {
        form.reset(defaultValues)
        $('#question-category-modal-create').modal('hide')
    } 

    const { trigger: createTrigger, isMutating: isMutatingCreate } = useMutationAction(QUESTION_CATEGORY.CREATE, 'post', {refreshKey: QUESTION_CATEGORY.GET, onSuccess: closeForm})
    const { trigger: updateTrigger, isMutating: isMutatingUpdate } = useMutationAction(QUESTION_CATEGORY.UPDATE, 'put', {refreshKey: QUESTION_CATEGORY.GET, onSuccess: closeForm})

    const defaultValues: QuestionGroupType = {
        name: '',
        description: undefined,
        code: '',
        status: 'active',
    }

    const form = useForm<QuestionGroupType>({
        mode: 'onChange',
        resolver: zodResolver(questioniGroupSchema),
        defaultValues
    })

    const onSubmit = (data: QuestionGroupType) => {
        const trigger = isEdit ? updateTrigger : createTrigger
        const dataToSubmit = isEdit ? {id: questionCategory?.id, ...data} : {...data}
        trigger(dataToSubmit)
    }

    useEffect(() => {
        if(!isEdit) form.reset(defaultValues)
        else form.reset(questionCategory)
    }, [isEdit, questionCategory])

    return (
        <div className="modal fade" tabIndex={-1} id="question-category-modal-create">
            <div className="modal-dialog">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{isEdit ? 'Ubah' : 'Tambah'} Kategori Soal</h5>
                            <button type="button" className="close-btn" data-bs-dismiss="modal"><IconX /></button>
                        </div>
                        <div className="modal-body">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>{'Nama'}</FormLabel>
                                        <FormControl>
                                            <input className="form-control" placeholder={'Masukkan nama'} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>{'Kode'}</FormLabel>
                                        <FormControl>
                                            <input className="form-control" placeholder={'Masukkan kode'} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{'Deskripsi'}</FormLabel>
                                        <FormControl>
                                            <textarea className="form-control" placeholder={'Masukkan deskripsi'} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel required>{'Status'}</FormLabel>
                                        <FormControl>
                                            <select className="form-select" aria-label="Default select example" {...field}>
                                                <option value="active">Aktif</option>
                                                <option value="inactive">Tidak Aktif</option>
                                            </select>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-primary-light" data-bs-dismiss="modal">Tutup</button>
                            <button type="submit" className="btn btn-primary" disabled={isMutatingCreate || isMutatingUpdate || !form.formState.isValid}>{isEdit ? 'Ubah' : 'Tambah'}</button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    )
}