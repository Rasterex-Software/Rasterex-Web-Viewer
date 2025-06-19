import { Component, Input, Output, EventEmitter, HostListener, OnInit } from '@angular/core';

export interface CommentItem {
  id: string;
  author: string;
  content: string;
  timestamp: Date;
  isEditing?: boolean;
}

export type TaskStatus = 'completed' | 'pending' | 'in-progress' | 'accepted' | 'rejected' | 'cancelled' | 'none' | 'marked' | 'unmarked';

export type AnnotationType = 'text' | 'freehand' | 'rectangle' | 'ellipse' | 'arrow' | 'highlight' | 'note';

export interface TaskItem {
  id: string;
  author: string;
  title: string;
  description?: string;
  status: TaskStatus;
  timestamp: Date;
  comments: CommentItem[];
  annotationType: AnnotationType;
}

@Component({
  selector: 'app-comment-card',
  templateUrl: './comment-card.component.html',
  styleUrls: ['./comment-card.component.scss']
})
export class CommentCardComponent implements OnInit {
  @Input() task: TaskItem | null = null;
  @Output() commentAdded = new EventEmitter<{taskId: string, content: string}>();
  @Output() commentEdited = new EventEmitter<{taskId: string, commentId: string, newContent: string}>();
  @Output() commentDeleted = new EventEmitter<{taskId: string, commentId: string}>();
  @Output() statusChanged = new EventEmitter<{taskId: string, status: string}>();
  @Output() taskStatusChanged = new EventEmitter<{ taskId: string, newStatus: string }>();

  isCollapsed = true;
  showStatusDropdown = false;
  editingCommentId: string | null = null;
  editCommentText = '';
  newCommentText = '';

  statusOptions = [
    { value: 'accepted', label: 'Accepted', icon: '👍' },
    { value: 'rejected', label: 'Rejected', icon: '👎' },
    { value: 'cancelled', label: 'Cancelled', icon: '❌' },
    { value: 'completed', label: 'Completed', icon: '✓' },
    { value: 'none', label: 'None', icon: '⬜' },
    { value: 'marked', label: 'Marked', icon: '●' },
    { value: 'unmarked', label: 'Unmarked', icon: '○' }
  ];

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    this.showStatusDropdown = false;
  }

  ngOnInit(): void {
    // Initialize any additional logic if needed
  }

  onAddComment(): void {
    if (this.newCommentText.trim() && this.task) {
      this.commentAdded.emit({
        taskId: this.task.id,
        content: this.newCommentText.trim()
      });
      this.newCommentText = '';
    }
  }

  onEditComment(comment: CommentItem): void {
    comment.isEditing = true;
  }

  onSaveComment(comment: CommentItem, newContent: string): void {
    if (newContent.trim() && this.task) {
      this.commentEdited.emit({
        taskId: this.task.id,
        commentId: comment.id,
        newContent: newContent.trim()
      });
      comment.isEditing = false;
    }
  }

  onCancelEdit(comment: CommentItem): void {
    comment.isEditing = false;
  }

  onDeleteComment(commentId: string): void {
    if (this.task) {
      this.commentDeleted.emit({
        taskId: this.task.id,
        commentId: commentId
      });
    }
  }

  toggleStatusDropdown(): void {
    this.showStatusDropdown = !this.showStatusDropdown;
  }

  onStatusSelect(status: string): void {
    if (this.task) {
      this.task.status = status as any;
      this.statusChanged.emit({
        taskId: this.task.id,
        status: status
      });
    }
    this.showStatusDropdown = false;
  }

  getStatusClass(status: string): string {
    switch(status) {
      case 'completed': return 'status-completed';
      case 'accepted': return 'status-accepted';
      case 'pending': return 'status-pending';
      case 'in-progress': return 'status-in-progress';
      case 'rejected': return 'status-rejected';
      case 'cancelled': return 'status-cancelled';
      case 'marked': return 'status-marked';
      case 'none': 
      case 'unmarked': 
      default: return 'status-default';
    }
  }

  getStatusText(status: string): string {
    switch(status) {
      case 'completed': return 'Completed';
      case 'accepted': return 'Accepted';
      case 'pending': return 'Pending';
      case 'in-progress': return 'In Progress';
      case 'rejected': return 'Rejected';
      case 'cancelled': return 'Cancelled';
      case 'marked': return 'Marked';
      case 'unmarked': return 'Unmarked';
      case 'none': return 'None';
      default: return status;
    }
  }

  getCurrentStatusIcon(): string {
    const statusOption = this.statusOptions.find(opt => opt.value === this.task?.status);
    return statusOption ? statusOption.icon : '○';
  }

  getAnnotationIconPath(): string {
    if (!this.task) return '';
    
    switch(this.task.annotationType) {
      case 'text': return '/assets/images/text-ico.svg';
      case 'freehand': return '/assets/images/paint-freehand-ico.svg';
      case 'rectangle': return '/assets/images/shape-rect-ico.svg';
      default: return '/assets/images/markup-info-ico.svg';
    }
  }

  // Keep this method for backward compatibility, but it now returns empty since we use images
  getAnnotationIcon(): string {
    return '';
  }

  getAnnotationClass(): string {
    if (!this.task) return 'annotation-default';
    
    switch(this.task.annotationType) {
      case 'text': return 'annotation-text';
      case 'freehand': return 'annotation-freehand';
      case 'rectangle': return 'annotation-rectangle';
      case 'ellipse': return 'annotation-ellipse';
      case 'arrow': return 'annotation-arrow';
      case 'highlight': return 'annotation-highlight';
      case 'note': return 'annotation-note';
      default: return 'annotation-default';
    }
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  onCheckboxChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    this.isCollapsed = !checkbox.checked;
  }

  selectStatus(status: TaskStatus): void {
    if (this.task) {
      this.task.status = status;
      this.taskStatusChanged.emit({ taskId: this.task.id, newStatus: status });
    }
    this.showStatusDropdown = false;
  }

  startEditComment(comment: CommentItem): void {
    this.editingCommentId = comment.id;
    this.editCommentText = comment.content;
  }

  saveCommentEdit(commentId: string): void {
    if (this.task && this.editCommentText.trim()) {
      const comment = this.task.comments.find(c => c.id === commentId);
      if (comment) {
        comment.content = this.editCommentText.trim();
        this.commentEdited.emit({ 
          taskId: this.task.id, 
          commentId, 
          newContent: this.editCommentText.trim() 
        });
      }
    }
    this.cancelCommentEdit();
  }

  cancelCommentEdit(): void {
    this.editingCommentId = null;
    this.editCommentText = '';
  }

  deleteComment(commentId: string): void {
    if (this.task) {
      this.task.comments = this.task.comments.filter(c => c.id !== commentId);
      this.commentDeleted.emit({
        taskId: this.task.id,
        commentId: commentId
      });
    }
  }
}
